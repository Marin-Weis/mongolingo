/**
 * Accueil.jsx -- Page d'accueil de Mongolingo
 *
 * Hooks utilisés :
 * useState  -> stocker des données qui peuvent changer (état local)
 * useEffect -> exécuter du code au chargement du composant
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { useEffect, useState } from 'react'
import { getHealth, resetData } from '../api/client.js'

export default function Accueil() {
  // État : est-ce que l'API répond ? null = en cours, true = ok, false = erreur
  const [apiOk, setApiOk] = useState(null)

  // État : message affiché après avoir cliqué sur "Reset"
  const [msgReset, setMsgReset] = useState('')

  // S'exécute une seule fois au chargement pour vérifier la connexion
  useEffect(() => {
    getHealth()
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false))
  }, [])

  // Appelée quand l'utilisateur clique sur "Reset demo-data"
  async function handleReset() {
    setMsgReset('Chargement...')
    try {
      const data = await resetData()
      setMsgReset('✓ Dataset rechargé : ' + data.collections.join(', '))
    } catch (e) {
      setMsgReset('✗ Erreur : ' + e.message)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Hero */}
      <div className="page-hero">
        <h1>Mongolingo</h1>
        <p>Quiz interactif pour apprendre les requêtes MongoDB</p>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">30</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">5</span>
          <span className="stat-label">Niveaux</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">3</span>
          <span className="stat-label">Collections</span>
        </div>
      </div>

      {/* Carte auteur */}
      <div className="card">
        <p className="section-title">Auteur</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="https://media.licdn.com/dms/image/v2/D4D03AQEXid0uVMcjBA/profile-displayphoto-scale_200_200/B4DZmLH075GwAY-/0/1758975711408?e=1776297600&v=beta&t=qh9pElNXbz2ZwT6jriX89ExEVG-QRDNE6i3hjwvhn98"
            alt="Marin Weis"
            style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 2 }}>Marin Weis</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>BUT Informatique — 2ème année</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 8 }}>R403 Qualité au-delà du relationnel</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="https://www.linkedin.com/in/marin-weis-22143a353/" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, border: '1.5px solid var(--border)', color: 'var(--text)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, background: 'var(--surface)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#0a66c2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a href="/consignes.pdf" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, border: '1.5px solid var(--border)', color: 'var(--text)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, background: 'var(--surface)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                </svg>
                Consignes PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Statut API + bouton reset */}
      <div className="grid2">

        {/* Indicateur de connexion au serveur */}
        <div className="card">
          <p className="section-title">État de l'API</p>
          {/* Affichage conditionnel selon la valeur de apiOk */}
          {apiOk === null && <p className="text-muted">Connexion en cours...</p>}
          {apiOk === true  && <p className="text-success">&#10003; API connectée à MongoDB</p>}
          {apiOk === false && <p className="text-danger">&#10005; API non disponible -- vérifiez que le serveur tourne</p>}
        </div>

        {/* Bouton pour recharger les données de démo */}
        <div className="card">
          <p className="section-title">Réinitialiser les données</p>
          <p className="text-muted" style={{ marginBottom: 6 }}>Recharge les données de démo dans MongoDB.</p>
          <button className="btn-outline" onClick={handleReset}>Reset demo-data</button>
          {/* Affiche le message de résultat s'il existe */}
          {msgReset && <p style={{ marginTop: 10, fontSize: '0.88rem' }}>{msgReset}</p>}
        </div>
      </div>

    </div>
  )
}