// src/components/Navbar.jsx
import { Link } from "react-router-dom";

function TaxistaNavbar() {
  return (
    <div className="index-navbar glass_nav">
      <nav className="pt-2 transition-all  navbar navbar-expand-lg navbar-light">
        <div className="backgroundResponsive navbar-default py-1 container">
          <a
            href="/inicio"
            className="mx-lg-3 mx-0 text-lg-end text-start navbar-brand"
          >
            <img
              src="https://proyectotaxis.s3.us-east-2.amazonaws.com/taxilogo.png"
              alt="Pillo_Logo"
              className="img-fluid imgLogoFekaTaxi"
            />
          </a>
          <div className="d-flex d-lg-none align-items-center"></div>
          <button
            aria-controls="navbarOffcanvas"
            type="button"
            aria-label="Toggle navigation"
            className="hamburger navbar-toggler collapsed"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="justify-content-center navbar-collapse collapse"
            id="navbarOffcanvas"
          >
            <div className="d-none d-lg-flex navbar-nav">
              <div className="nav-item dropdown"></div>
              <a href="/taxistas"  className="nav-link">
                Inicio
              </a>
              <a href="/taxistas"  className="nav-link">
                Ver Reportes
              </a>
              <a className="nav-link" href="/taxistas">
                Coming soon
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default TaxistaNavbar;
