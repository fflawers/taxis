import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../secure/AuthContext";

function Formulario() {
  const [showPassword, setShowPassword] = useState(false);
  const [noLista, setNoLista] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ no_lista: noLista, contrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.usuario);
        const rol = data.rol?.toLowerCase();

        if (rol === "admin") {
          navigate("/inicio");
        } else if (rol === "taxista") {
          navigate("/taxistas");
        }
      } else {
        setMensajeError(data.message || "Error al iniciar sesión.");
      }
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-bg-pattern"></div>

      <div className="login-card animate-slide-up">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🚕</span>
          <h1 className="login-title">TaxiControl</h1>
          <p className="login-subtitle">Sistema de Gestión de Taxis</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mensajeError && (
            <div className="login-error animate-fade-in">
              ⚠️ {mensajeError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Número de Lista</label>
            <input
              type="text"
              inputMode="numeric"
              className="form-control"
              placeholder="Ej: 12345"
              required
              maxLength="10"
              value={noLista}
              onChange={(e) => setNoLista(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                className="form-control"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-btn-loading">
                <span className="spinner"></span>
                Ingresando...
              </span>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="login-footer">
          © 2026 TaxiControl • Todos los derechos reservados
        </p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at top left, rgba(244, 211, 94, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(102, 126, 234, 0.1) 0%, transparent 50%);
          z-index: -1;
        }

        .login-card {
          background: var(--color-bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-xl);
          padding: 3rem;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow-lg);
        }

        .login-logo {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.25rem 0;
        }

        .login-subtitle {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .login-error {
          background: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 0.875rem 1rem;
          border-radius: var(--border-radius-md);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          font-size: 1.1rem;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: var(--color-accent);
        }

        .login-btn {
          width: 100%;
          margin-top: 0.5rem;
          font-size: 1rem;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--color-bg-primary);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem;
          }
          
          .login-logo-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Formulario;
