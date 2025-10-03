import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/assets/Global.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // opcional, solo si usarás modals, tooltips, etc.


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
