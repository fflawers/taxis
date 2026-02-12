package com.diri.confluence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Base64;

public class MigrationTool {

    private static String API_URL;
    private static String USER_EMAIL;
    private static String API_TOKEN;
    private static String SPACE_KEY;

    private static final String IMAGES_DIR = "../confluence-images";
    private static final String TEMP_DIR = "../temp-mermaid";
    // Se asume la ejecución desde el directorio 'confluence-tool', por lo que '..'
    // es la raíz del documento.

    private static final HttpClient client = HttpClient.newHttpClient();
    private static final ObjectMapper jsonMapper = new ObjectMapper();

    public static void main(String[] args) {
        System.out.println(" Diri Migration Tool");

        try {
            // 1. Configuración de Directorios
            Path imagesStartDir = Paths.get(IMAGES_DIR);
            Path tempStartDir = Paths.get(TEMP_DIR);

            Files.createDirectories(imagesStartDir);
            Files.createDirectories(tempStartDir);

            // 2. Cargar Configuración
            File configFile = new File("../migration_config.json");
            if (!configFile.exists()) {
                System.err.println(" No se encontró ../migration_config.json");
                System.exit(1);
            }
            JsonNode config = jsonMapper.readTree(configFile);
            JsonNode docs = config.get("docs");

            System.out.println(" Configuración cargada. Procesando " + docs.size() + " documentos...");

            // --- FASE 1: GENERACIÓN DE DIAGRAMAS Y PREPARACIÓN DE CONTENIDO ---
            System.out.println("\n  FASE 1: Generando Diagramas Mermaid...");

            // Mapa para almacenar el contenido procesado: Nombre de archivo -> Markdown
            // Procesado
            Map<String, String> processedDocs = new LinkedHashMap<>(); // Preservar orden

            for (JsonNode doc : docs) {
                String title = doc.get("title").asText();
                String filename = doc.get("file").asText();
                String filePath = "../" + filename; // Relativo al directorio de ejecución

                if (!new File(filePath).exists()) {
                    System.err.println("    Archivo no encontrado: " + filePath);
                    continue;
                }

                // Paso A: Convertir Mermaid
                // Se hace esto ANTES de pedir credenciales para fallar rápido si mermaid
                // falla
                System.out.println("   Procesando diagramas en: " + filename);
                String mdContent = Files.readString(Paths.get(filePath));
                String processedMd = processMermaidDiagrams(mdContent, filename);

                processedDocs.put(filename, processedMd);
            }

            System.out.println("    Generación de diagramas completada.");

            // --- FASE 2: CARGA A CONFLUENCE ---
            // 3. Credenciales (Solo solicitar si se llegó hasta aquí)
            getCredentials();

            System.out.println("\n  FASE 2: Subiendo a Confluence...");

            for (JsonNode doc : docs) {
                String title = doc.get("title").asText();
                String filename = doc.get("file").asText();

                if (!processedDocs.containsKey(filename)) {
                    continue; // Omitido debido a que el archivo no se encontró anteriormente
                }

                String processedMd = processedDocs.get(filename);

                System.out.println("\n Subiendo: " + filename + " -> '" + title + "'");

                // Paso B: Crear marcador de posición de página
                String pageId = createOrUpdatePage(title, "<p>Cargando...</p>", null);
                if (pageId == null)
                    continue;

                // Paso C: Convertir a HTML y cargar imágenes
                String htmlContent = processMarkdownToHtml(processedMd, pageId);

                // Paso D: Actualizar página con contenido final
                createOrUpdatePage(title, htmlContent, pageId);
            }

            System.out.println("\n Migración Completada Exitosamente.");

        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void getCredentials() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("\n Configuración de Confluence");
        System.out.println("--------------------------------");

        System.out.print("URL Base (ej. https://empresa.atlassian.net): ");
        API_URL = scanner.nextLine().trim();
        if (API_URL.endsWith("/wiki"))
            API_URL = API_URL.substring(0, API_URL.length() - 5);
        if (API_URL.endsWith("/"))
            API_URL = API_URL.substring(0, API_URL.length() - 1);
        if (!API_URL.startsWith("http"))
            API_URL = "https://" + API_URL;

        System.out.print("Email: ");
        USER_EMAIL = scanner.nextLine().trim();

        System.out.print("API Token: ");
        API_TOKEN = scanner.nextLine().trim();

        System.out.print("Space Key: ");
        SPACE_KEY = scanner.nextLine().trim();
    }

    // --- Lógica Mermaid ---

    private static String processMermaidDiagrams(String content, String baseFilename) throws Exception {
        // Expresión regular para ```mermaid ... ```
        Pattern pattern = Pattern.compile("```mermaid\\n([\\s\\S]*?)```");
        Matcher matcher = pattern.matcher(content);

        StringBuffer sb = new StringBuffer();
        int count = 0;

        // Se limpia el nombre base del archivo para las imágenes
        String safeBaseName = new File(baseFilename).getName().replace(".md", "");

        while (matcher.find()) {
            count++;
            String code = matcher.group(1).trim();
            String diagNum = String.format("%02d", count);

            // Usar rutas absolutas para ProcessBuilder para evitar confusiones
            File tempDir = new File(TEMP_DIR).getCanonicalFile();
            File imagesDir = new File(IMAGES_DIR).getCanonicalFile();

            // Asegurar que existen (redundante pero seguro)
            tempDir.mkdirs();
            imagesDir.mkdirs();

            File mmdFile = new File(tempDir, safeBaseName + "_" + diagNum + ".mmd");
            File pngFile = new File(imagesDir, safeBaseName + "_" + diagNum + ".png");

            // Escribir MMD
            Files.writeString(mmdFile.toPath(), code);

            System.out.print("        Diagrama " + count + "...");

            // Ejecutar mmdc
            // Usar rutas absolutas para entrada y salida
            ProcessBuilder pb = new ProcessBuilder(
                    "npx", "--no-install", "mmdc",
                    "-i", mmdFile.getAbsolutePath(),
                    "-o", pngFile.getAbsolutePath(),
                    "-b", "transparent");

            // Establecer directorio de trabajo al padre de confluence-tool (raíz del
            // documento)
            // Esto ayuda si npx o node_modules se esperan relativos a la raíz del proyecto
            pb.directory(new File("..").getCanonicalFile());

            Process p = pb.start();
            int exitCode = p.waitFor();

            if (exitCode == 0) {
                System.out.println(" OK");
                // Reemplazar con enlace de imagen usando solo el nombre de archivo (cargado más
                // tarde)
                // Usando sintaxis de imagen Markdown
                String imageRef = "![" + safeBaseName + "_" + diagNum + "](" + safeBaseName + "_" + diagNum + ".png)";
                matcher.appendReplacement(sb, Matcher.quoteReplacement(imageRef));
            } else {
                System.out.println(" FAIL");
                String error = new String(p.getErrorStream().readAllBytes());
                System.err.println("Mermaid Error: " + error);
                throw new RuntimeException("Mermaid conversion failed");
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    // --- Lógica Confluence ---

    private static String getBasicAuthHeader() {
        String auth = USER_EMAIL + ":" + API_TOKEN;
        return "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
    }

    private static String createOrUpdatePage(String title, String content, String knownPageId) throws Exception {
        String authHeader = getBasicAuthHeader();

        // 1. Buscar si no se conoce
        String pageId = knownPageId;
        int version = 1;

        if (pageId == null) {
            String searchUrl = API_URL + "/wiki/rest/api/content?title=" +
                    java.net.URLEncoder.encode(title, StandardCharsets.UTF_8) +
                    "&spaceKey=" + SPACE_KEY + "&expand=version";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(searchUrl))
                    .header("Authorization", authHeader)
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = jsonMapper.readTree(response.body());

            if (root.has("results") && root.get("results").size() > 0) {
                JsonNode page = root.get("results").get(0);
                pageId = page.get("id").asText();
                version = page.get("version").get("number").asInt() + 1;
            }
        } else {
            // Si se tiene ID, aún se necesita la versión para actualizar
            String infoUrl = API_URL + "/wiki/rest/api/content/" + pageId + "?expand=version";
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(infoUrl)).header("Authorization", authHeader)
                    .GET().build();
            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode page = jsonMapper.readTree(res.body());
            version = page.get("version").get("number").asInt() + 1;
        }

        // 2. Preparar Carga Útil
        Map<String, Object> storage = new HashMap<>();
        storage.put("value", content);
        storage.put("representation", "storage");

        Map<String, Object> body = new HashMap<>();
        body.put("storage", storage);

        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("type", "page");
        Map<String, String> space = new HashMap<>();
        space.put("key", SPACE_KEY);
        payload.put("space", space);
        payload.put("body", body);

        Map<String, Object> verObj = new HashMap<>();
        verObj.put("number", version);
        payload.put("version", verObj);

        String jsonPayload = jsonMapper.writeValueAsString(payload);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json");

        if (pageId != null) {
            builder.uri(URI.create(API_URL + "/wiki/rest/api/content/" + pageId));
            builder.PUT(HttpRequest.BodyPublishers.ofString(jsonPayload));
        } else {
            builder.uri(URI.create(API_URL + "/wiki/rest/api/content"));
            builder.POST(HttpRequest.BodyPublishers.ofString(jsonPayload));
        }

        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode res = jsonMapper.readTree(response.body());
            String newId = res.get("id").asText();
            String action = (pageId == null) ? "Creada" : "Actualizada";
            System.out.println("    Página " + action + ": " + title);
            return newId;
        } else {
            System.err.println("    Error: " + response.statusCode() + " " + response.body());
            return null;
        }
    }

    private static void uploadAttachment(String pageId, String filename) {
        // El nombre de archivo es solo 'file.png'. Se busca en IMAGES_DIR
        File file = new File(IMAGES_DIR, filename);
        if (!file.exists()) {
            System.err.println("    Imagen no encontrada: " + file.getPath());
            return;
        }

        try {
            String authHeader = getBasicAuthHeader();

            // Verificar existente
            String checkUrl = API_URL + "/wiki/rest/api/content/" + pageId + "/child/attachment?filename=" + filename;
            HttpRequest checkReq = HttpRequest.newBuilder().uri(URI.create(checkUrl))
                    .header("Authorization", authHeader).GET().build();
            HttpResponse<String> checkRes = client.send(checkReq, HttpResponse.BodyHandlers.ofString());
            JsonNode checkJson = jsonMapper.readTree(checkRes.body());

            String attId = null;
            if (checkJson.has("results") && checkJson.get("results").size() > 0) {
                attId = checkJson.get("results").get(0).get("id").asText();
            }

            // Carga multiparte - ¡Java HttpClient no tiene Multipart incorporado!
            // Se debe construir manualmente. Es verboso.
            // Para simplicidad en esta 'herramienta única', se realiza una construcción
            // manual
            // de multiparte simple.

            String boundary = "---ConfluenceBoundary" + System.currentTimeMillis();
            String delimiter = "--" + boundary;
            String close = "--" + boundary + "--";

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8), true);

            writer.append(delimiter).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"")
                    .append("\r\n");
            writer.append("Content-Type: image/png").append("\r\n");
            writer.append("\r\n");
            writer.flush();

            Files.copy(file.toPath(), baos);
            writer.append("\r\n");
            writer.flush();

            writer.append(close).append("\r\n");
            writer.flush();

            byte[] multipartBody = baos.toByteArray();

            String uploadUrl = API_URL + "/wiki/rest/api/content/" + pageId + "/child/attachment";
            if (attId != null) {
                uploadUrl += "/" + attId + "/data";
            }

            HttpRequest.Builder upBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", authHeader)
                    .header("X-Atlassian-Token", "nocheck")
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody));

            HttpResponse<String> upRes = client.send(upBuilder.build(), HttpResponse.BodyHandlers.ofString());

            if (upRes.statusCode() == 200) {
                System.out.println("    Adjunto: " + filename);
            } else {
                System.err.println("    Error subiendo adjunto: " + upRes.statusCode());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String processMarkdownToHtml(String mdContent, String pageId) {
        // 1. Conversión CommonMark
        Parser parser = Parser.builder()
                .extensions(List.of(TablesExtension.create()))
                .build();
        HtmlRenderer renderer = HtmlRenderer.builder()
                .extensions(List.of(TablesExtension.create()))
                .build();

        String html = renderer.render(parser.parse(mdContent));

        // 2. Procesamiento Jsoup
        Document doc = Jsoup.parseBodyFragment(html);

        for (Element img : doc.select("img")) {
            String src = img.attr("src");
            // El src debería ser solo 'filename.png' porque se procesó en
            // processMermaidDiagrams
            // verificar si tiene ruta
            String filename = new File(src).getName();

            // Cargar
            uploadAttachment(pageId, filename);

            // Reemplazar con <ac:image>
            Element acImage = doc.createElement("ac:image");
            Element riAttachment = doc.createElement("ri:attachment");
            riAttachment.attr("ri:filename", filename);
            acImage.appendChild(riAttachment);

            img.replaceWith(acImage);
        }

        // 3. Salida
        // Jsoup envuelve en <html><body>...</body></html>, solo se desea el contenido
        // del cuerpo
        // Pero parseBodyFragment devuelve el documento completo.
        return doc.body().html();
    }
}
