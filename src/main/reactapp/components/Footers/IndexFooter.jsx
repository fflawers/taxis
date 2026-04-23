import '../../assets/Global.css';


function IndexFooter() {
    const handleMedio = (sm) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'contact',
            via: sm,
        });
    };

    return (
        <footer className="bg-explora text-white">
            <div className="container text-footer">
                <div className="row d-flex justify-content-center pt-lg-5 pt-3">
                    {/* Sección de contacto */}
                    <div className="col-xl-4 col-12 text-center order-1">
                       
                        <div className="m-auto">
                            <img
                                loading="lazy"
                                className="img-fluid w-50 my-3"
                                src="https://proyectotaxis.s3.us-east-2.amazonaws.com/Gemini_Generated_Image_yfb08kyfb08kyfb0-removebg-preview.png"
                                alt="marcacion"
                            />
                        </div>



                         <p className="mb-1 mt-4"><b>CONTÁCTANOS</b></p>
                        <p className="mb-3">
                            Desde cualquier número al <br />
                            <a
                                style={{ color: "white", textDecoration: "none" }}
                                href="https://wa.me/5512148668"
                            >
                                55 1214 8668
                            </a>
                        </p>
                    </div>
                </div>
                

                {/* Copyright */}
                <div className="row justify-content-center mx-auto pt-2">
                    <div className="col-xl-12">
                        <p className="text-center textCopy">

                            <a href="https://github.com/fflawers/">Desarrollado por Fernando Flores García.</a>
                        </p>
                    </div>
                </div>

                {/* Botón de Whatsapp */}
                <a
                    href="https://wa.me/5512148668"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleMedio('whatsapp')}
                >
                    <img
                        loading="lazy"
                        src="https://proyectotaxis.s3.us-east-2.amazonaws.com/WhatsApp-button.webp"
                        className="imgWhats"
                        alt="whats_button"
                    />
                </a>
            </div>
        </footer>
    );
}

export default IndexFooter;
