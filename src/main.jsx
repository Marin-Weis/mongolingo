/**
 * main.jsx -> Point d'entrée de l'application React
 *
 * Démarre l'application et la monte dans la div#root de index.html.
 * StrictMode -> affiche des avertissements supplémentaires en développement
 * BrowserRouter -> active la navigation par URL (React Router)
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter permet d'utiliser NavLink et Routes dans toute l'app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)