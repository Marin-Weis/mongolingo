/**
 * ImportExport.jsx -> Page d'import et d'export de données
 *
 * Permet d'exporter et d'importer les collections MongoDB :
 * JSON -> texte lisible, format standard
 * BSON -> binaire encodé en base64
 *
 * Modes d'import disponibles :
 * replace -> vide la collection avant d'insérer
 * append -> ajoute les documents sans supprimer les existants
 *
 * Hooks utilisés :
 * useState -> gérer la collection sélectionnée, le mode, les textes saisis, les messages
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { useState } from 'react'
import { exporterJson, exporterBson, importerJson, importerBson } from '../api/client.js'

/**
 * Déclenche le téléchargement d'un fichier dans le navigateur.
 * @param {string} nom - Nom du fichier téléchargé (ex: "users.json")
 * @param {string} contenu - Contenu texte du fichier
 * @param {string} type - Type MIME (ex: "application/json")
 */
function telecharger(nom, contenu, type) {
  const blob = new Blob([contenu], { type })  // Crée un objet fichier en mémoire
  const url = URL.createObjectURL(blob)      // Génère une URL temporaire vers ce blob
  const a = document.createElement('a')    // Crée un lien invisible
  a.href = url
  a.download = nom
  a.click()                                   // Simule le clic pour déclencher le téléchargement
  URL.revokeObjectURL(url)                    // Libère la mémoire
}

export default function ImportExport() {
  // Collection sélectionnée dans le menu déroulant
  const [collection, setCollection] = useState('users')

  // Mode d'import : 'replace' ou 'append'
  const [mode, setMode] = useState('replace')

  // Contenu JSON saisi par l'utilisateur pour l'import
  const [jsonTexte, setJsonTexte] = useState('[]')

  // Contenu BSON (base64) saisi par l'utilisateur pour l'import
  const [bsonBase64, setBsonBase64] = useState('')

  // Message de succès ou d'erreur affiché à l'utilisateur
  const [msg, setMsg] = useState('')

  // Exécute fn() et affiche le message retourné ou l'erreur
  async function wrap(fn) {
    setMsg('')
    try {
      setMsg(await fn())
    } catch (e) {
      setMsg('Erreur : ' + e.message)
    }
  }

  return (
    <div>

      {/* Titre de la page */}
      <div className="page-hero">
        <h1>Import / Export</h1>
        <p>Charge ou exporte les données au format JSON et BSON</p>
      </div>

      {/* Sélection de la collection et du mode */}
      <div className="card">
        <p className="section-title">Configuration</p>
        <div className="grid2">

          {/* Choix de la collection */}
          <div>
            <label>Collection</label>
            <select value={collection} onChange={e => setCollection(e.target.value)}>
              <option value="users">users</option>
              <option value="orders">orders</option>
              <option value="lessons">lessons</option>
            </select>
          </div>

          {/* Choix du mode d'import */}
          <div>
            <label>Mode d'import</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="replace">replace -- vider puis inserer</option>
              <option value="append">append -- ajouter aux existants</option>
            </select>
          </div>
        </div>

        {/* Boutons d'export */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>

          {/* Export JSON : télécharge un fichier .json lisible */}
          <button className="btn-primary" onClick={() => wrap(async () => {
            const texte = await exporterJson(collection)
            telecharger(`${collection}.json`, texte, 'application/json')
            return `Export JSON de "${collection}" téléchargé`
          })}>
            Exporter JSON
          </button>

          {/* Export BSON : télécharge le base64 et pré-remplit le champ import */}
          <button className="btn-outline" onClick={() => wrap(async () => {
            const { base64 } = await exporterBson(collection)
            setBsonBase64(base64)
            telecharger(`${collection}.bson.b64.txt`, base64, 'text/plain')
            return `Export BSON de "${collection}" téléchargé`
          })}>
            Exporter BSON
          </button>
        </div>

        {/* Message de retour (succès ou erreur) */}
        {msg && (
          <p style={{ marginTop: 12, fontSize: '0.88rem', fontWeight: 600,
            color: msg.startsWith('Erreur') ? 'var(--danger)' : 'var(--success)' }}>
            {msg}
          </p>
        )}
      </div>

      <hr />

      {/* Import JSON et BSON côte à côte */}
      <div className="grid2">

        {/* Import JSON : l'utilisateur colle un tableau JSON */}
        <div className="card">
          <p className="section-title">Importer JSON</p>
          <p className="text-muted" style={{ marginBottom: 8 }}>Colle un tableau JSON de documents.</p>
          <textarea
            rows={10}
            value={jsonTexte}
            onChange={e => setJsonTexte(e.target.value)}
            placeholder='[{ "_id": "user_99", "name": "Test" }]'
          />
          <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => wrap(async () => {
            const res = await importerJson(collection, mode, jsonTexte)
            return `${res.inserted} document(s) importés (mode: ${res.mode})`
          })}>
            Importer JSON
          </button>
        </div>

        {/* Import BSON : l'utilisateur colle le contenu base64 d'un export BSON */}
        <div className="card">
          <p className="section-title">Importer BSON (base64)</p>
          <p className="text-muted" style={{ marginBottom: 8 }}>Colle le contenu base64 d'un export BSON.</p>
          <textarea
            rows={10}
            value={bsonBase64}
            onChange={e => setBsonBase64(e.target.value)}
            placeholder="Coller le base64 ici..."
          />
          {/* Bouton désactivé si le champ est vide */}
          <button className="btn-outline" style={{ marginTop: 12 }} disabled={!bsonBase64}
            onClick={() => wrap(async () => {
              const res = await importerBson(collection, mode, bsonBase64)
              return `${res.inserted} document(s) importés (mode: ${res.mode})`
            })}>
            Importer BSON
          </button>
        </div>
      </div>

    </div>
  )
}