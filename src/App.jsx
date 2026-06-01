/**
 * App.jsx -- Composant racine : mise en page et navigation
 *
 * Définit la structure globale de l'application :
 * header -> barre de navigation avec les liens vers chaque page
 * main   -> affiche la page active via React Router
 * footer -> logos UBS/IUT et lien LinkedIn
 *
 * React Router :
 * NavLink -> met à jour l'URL sans recharger la page
 * Routes + Route -> affiche le composant correspondant à l'URL
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { NavLink, Route, Routes, useLocation } from 'react-router-dom'

import Accueil from './pages/Accueil.jsx'
import Quiz from './pages/Quiz.jsx'
import Collections from './pages/Collections.jsx'
import ImportExport from './pages/ImportExport.jsx'
import Sauvegardes from './pages/Sauvegardes.jsx'

export default function App() {
  const location = useLocation() // Hook pour accéder à l'URL courante
  return (
    // Conteneur principal en colonne pour que le footer reste en bas
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Header / Barre de navigation */}
      <header className="navbar">
        <div className="container navbar-inner">

          {/* Logo cliquable qui ramène à l'accueil */}
          <a href="/" className="navbar-brand">
            Mongolingo{' '}
            <span>-- R403 - NoSQL</span>
          </a>

          {/* NavLink ajoute automatiquement la classe "active" sur le lien de la page courante */}
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <NavLink to="/" end          className={({ isActive }) => isActive ? 'active' : ''}>Accueil</NavLink>
            <NavLink to="/quiz"          className={({ isActive }) => isActive ? 'active' : ''}>Quiz</NavLink>
            <NavLink to="/collections"   className={({ isActive }) => isActive ? 'active' : ''}>Collections</NavLink>
            <NavLink to="/import-export" className={({ isActive }) => isActive ? 'active' : ''}>Import/Export</NavLink>
            <NavLink to="/sauvegardes"   className={({ isActive }) => isActive ? 'active' : ''}>Sauvegardes</NavLink>
          </nav>
        </div>
      </header>

      {/* Contenu principal : flex 1 pour occuper tout l'espace disponible */}
      <main style={{ flex: 1 }}>
        <div className="container page">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/sauvegardes" element={<Sauvegardes />} />
            <Route path="*" element={<></>} />
          </Routes>

          {/* Quiz toujours monté dans le container, caché sur les autres pages */}
          <div style={{ display: location.pathname === '/quiz' ? 'block' : 'none' }}>
            <Quiz />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">

          {/* Logos UBS et IUT Vannes */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 14 }}>
            <img
              src="https://www.univ-ubs.fr/_richText-file/ametys-internal%253Asites/wwwdev/ametys-internal%253Acontents/normes-graphiques-article/_attribute/content/_data/UBS-LOGO-RVB-Fd-Transparent_150x212.png"
              alt="Logo UBS"
              style={{ height: 38, filter: 'grayscale(100%)', opacity: 0.55, transition: 'all 0.3s' }}
              onMouseOver={e => { e.target.style.filter = 'grayscale(0%)'; e.target.style.opacity = '1' }}
              onMouseOut={e  => { e.target.style.filter = 'grayscale(100%)'; e.target.style.opacity = '0.55' }}
            />
            <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />
            <img
              src="https://www.iutvannes.fr/wp-content/uploads/2020/11/IUT_VANNES_LOGO-sansfondblanc-e1669819263791.png"
              alt="IUT de Vannes"
              style={{ height: 44, filter: 'grayscale(100%)', opacity: 0.55, transition: 'all 0.3s' }}
              onMouseOver={e => { e.target.style.filter = 'grayscale(0%)'; e.target.style.opacity = '1' }}
              onMouseOut={e  => { e.target.style.filter = 'grayscale(100%)'; e.target.style.opacity = '0.55' }}
            />
          </div>

          <p>Créé par <strong style={{ color: '#1e293b' }}>Marin Weis</strong></p>

          {/* Lien LinkedIn */}
          <a
            href="https://www.linkedin.com/in/marin-weis-22143a353/"
            target="_blank"
            rel="noreferrer"
            className="linkedin-btn"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
              alt="LinkedIn"
              style={{ width: 18, height: 18, borderRadius: 3 }}
            />
            LinkedIn
          </a>
        </div>
      </footer>

    </div>
  )
}