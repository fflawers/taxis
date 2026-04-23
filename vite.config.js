import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // index.html está en la raíz del proyecto (aquí)
  root: '.',

  resolve: {
    alias: {
      // '@' apunta a src/main/reactapp/ — equivalente al 'src/' de un proyecto Vite normal
      '@': path.resolve(__dirname, 'src/main/reactapp'),
    },
  },

  build: {
    // Vite genera los assets aquí → Spring Boot los sirve automáticamente
    outDir: 'src/main/resources/static',
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    // En desarrollo, el proxy envía llamadas al backend Kotlin
    proxy: {
      '/login': 'http://localhost:8080',
      '/usuarios': 'http://localhost:8080',
      '/taxis': 'http://localhost:8080',
      '/incidencias': 'http://localhost:8080',
      '/acuerdos': 'http://localhost:8080',
      '/reportes': 'http://localhost:8080',
      '/ingresos': 'http://localhost:8080',
      '/dashboard': 'http://localhost:8080',
      '/prueba': 'http://localhost:8080',
    },
  },
})