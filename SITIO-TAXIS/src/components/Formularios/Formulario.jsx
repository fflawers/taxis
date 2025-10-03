import React from "react";
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function Formulario() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="container spaceNavbarGeneral">
        <div className="row justify-content-center my-5 mx-auto">
          <div className="col-12 col-lg-5 m-auto">
            <div className="row">
              <div className="col-12 col-lg-10 text-center m-auto">
                <h1>Inicia tu sesión</h1>
                <p className="my-3 text-general">
                  Ingresa tu username y contraseña:
                </p>
                <div className="row">
                  <form
                  // onSubmit={handleSubmit}
                  >
                    <div className="row d-block m-auto">
                      <div className="col-12 my-3 text-start">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="numero"
                          className="col-11 inputG px-3 py-2 mb-4"
                          id="numero"
                          placeholder="Username"
                          required
                          maxLength="10"
                          // value={numero}
                          // onChange={(e) => setNumero(e.target.value)}
                        />
                        
                        <input
                          name="correo"
                          className="inputG px-3 py-2 col-11"
                          id="correo"
                          placeholder="Contraseña"
                          type={showPassword ? 'text' : 'password'}
                          required
                          // value={correo}
                          // onChange={(e) => setCorreo(e.target.value)}
                        />
                        <button
                          type="button"
                          className="col-1 button-eye"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                       =
                        
                      </div>
                      <div className="col-11 my-3">
                        <button
                          type="submit"
                          id="submit-btn"
                          className="btnIngresarVerde py-2 px-3 col-lg-12"
                          // disabled={!isValidForm}
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-12 col-lg-7 text-center m-auto borderB">
            <p className="my-5 txtSubtitle">
              ¡Descarga la app y olvídate de complicaciones!
            </p>
            <div className="row justify-content-center mx-auto mb-lg-5 mb-auto">
              <div className="col-4">
                <img
                  loading="lazy"
                  src="https://d3jkoqalzfs5lw.cloudfront.net/imagenesPillo/Website/icono_app.svg"
                  className="img-fluid img-diri-min align-items-center d-flex my-4 mx-auto"
                  alt="appicon"
                />
              </div>
              <div className="col-8 m-auto">
                <p className="descApp">
                  Activa la auto-recarga para ahorrar en cada recarga
                </p>
                <div className="row">
                  <div className="col-6 mx-auto my-1">
                    <a href="https://apps.apple.com/mx/app/pillofon/id1536302343">
                      <img
                        className="img-fluid d-block m-auto"
                        src="https://d3jkoqalzfs5lw.cloudfront.net/imagesDiri/home/app_store.webp"
                        alt="appstore"
                      />
                    </a>
                  </div>
                  <div className="col-6 mx-auto my-1">
                    <a href="https://play.google.com/store/apps/details?id=mx.pillofon&hl=es_MX&pli=1">
                      <img
                        className="img-fluid d-block m-auto"
                        src="https://d3jkoqalzfs5lw.cloudfront.net/imagesDiri/home/google_play.webp"
                        alt="playstore"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        {/* {isLoading && <Loading />}
                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Body className="text-center">
                        <p className="my-2 mx-auto titleModal">¡Ups!</p>
                        <p className="text-center mx-auto mt-5 mb-3 contentModal">{mensajeError}</p>
                        <div className="col-8 text-center m-auto">
                            <button className="btnModal py-2" onClick={handleClose}>
                                De acuerdo
                            </button>
                        </div>
                    </Modal.Body>
                </Modal> */}
      </div>
      <div className="line"></div>
    </div>
  );
}

export default Formulario;
