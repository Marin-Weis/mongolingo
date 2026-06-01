/**
 * Sauvegardes.jsx -> Gestion des sauvegardes de données
 *
 * Permet de créer, lister et restaurer des sauvegardes MongoDB :
 * création -> sauvegarde les collections dans backups/ (JSON + BSON)
 * liste -> affiche les sauvegardes disponibles
 * restauration -> recharge une sauvegarde dans MongoDB
 *
 * Hooks utilisés :
 * useState -> label, collections cochées, liste des sauvegardes, sélection, mode, message
 * useEffect -> charge la liste des sauvegardes au chargement de la page
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { useEffect, useState } from 'react'
import { listerSauvegardes, creerSauvegarde, restaurerSauvegarde } from '../api/client.js'

// Collections disponibles dans l'application
const TOUTES_COLLECTIONS = ['users', 'orders', 'lessons']

export default function Sauvegardes() {
  // Label de la sauvegarde (ex: "avant-import")
  const [label, setLabel] = useState('demo')

  // Collections sélectionnées pour la création (indépendant de la restauration)
  const [collectionsCreer, setCollectionsCreer] = useState(['users', 'orders', 'lessons'])

  // Collections sélectionnées pour la restauration (indépendant de la création)
  const [collectionsRestaurer, setCollectionsRestaurer] = useState(['users', 'orders', 'lessons'])

  // Liste des sauvegardes disponibles (noms des dossiers dans backups/)
  const [sauvegardes, setSauvegardes] = useState([])

  // Nom de la sauvegarde sélectionnée pour la restauration
  const [selected, setSelected] = useState('')

  // Mode de restauration : 'replace' ou 'append'
  const [mode, setMode] = useState('replace')

  // Message de succès ou d'erreur
  const [msg, setMsg] = useState('')

  // Charge la liste au premier rendu
  useEffect(() => {
    chargerListe()
  }, [])

  // Récupère les sauvegardes depuis l'API et met à jour le state
  async function chargerListe() {
    try {
      const data = await listerSauvegardes()
      setSauvegardes(data.backups || [])
      // Pré-sélectionne la première sauvegarde si elle existe
      if (data.backups?.length > 0) {
        setSelected(data.backups[0])
      }
    } catch (e) {
      setMsg('Erreur : ' + e.message)
    }
  }

  // Ajoute ou retire une collection de la sélection pour la création
  function toggleColCreer(col) {
    if (collectionsCreer.includes(col)) {
      setCollectionsCreer(collectionsCreer.filter(c => c !== col))
    } else {
      setCollectionsCreer([...collectionsCreer, col])
    }
  }

  // Ajoute ou retire une collection de la sélection pour la restauration
  function toggleColRestaurer(col) {
    if (collectionsRestaurer.includes(col)) {
      setCollectionsRestaurer(collectionsRestaurer.filter(c => c !== col))
    } else {
      setCollectionsRestaurer([...collectionsRestaurer, col])
    }
  }

  // Crée une nouvelle sauvegarde et rafraîchit la liste
  async function handleCreer() {
    setMsg('')
    try {
      const res = await creerSauvegarde(label || 'backup', collectionsCreer)
      setMsg('Sauvegarde créée : ' + res.dir)
      chargerListe()
    } catch (e) {
      setMsg('Erreur : ' + e.message)
    }
  }

  // Restaure la sauvegarde sélectionnée dans MongoDB
  async function handleRestaurer() {
    if (!selected) return
    setMsg('')
    try {
      await restaurerSauvegarde(selected, mode, collectionsRestaurer)
      setMsg('Restauration OK depuis : ' + selected)
    } catch (e) {
      setMsg('Erreur : ' + e.message)
    }
  }

  return (
    <div>

      {/* Titre de la page */}
      <div className="page-hero">
        <h1>Sauvegardes</h1>
        <p>Crée et restaure des sauvegardes JSON + BSON de tes collections</p>
      </div>

      {/* Section : créer une sauvegarde */}
      <div className="card">
        <p className="section-title">Créer une sauvegarde</p>
        <p className="text-muted" style={{ marginBottom: 4 }}>
          Les sauvegardes sont stockées dans <code>backups/</code> au format JSON et BSON.
        </p>

        <div className="grid2">
          {/* Champ texte pour le label */}
          <div>
            <label>Label</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="ex: avant-import"
            />
          </div>

          {/* Cases à cocher pour choisir les collections à sauvegarder */}
          <div>
            <label>Collections</label>
            <div className="chips">
              {TOUTES_COLLECTIONS.map(col => (
                <label key={col} className="chip">
                  <input
                    type="checkbox"
                    checked={collectionsCreer.includes(col)}
                    onChange={() => toggleColCreer(col)}
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Boutons créer et rafraîchir */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn-primary" onClick={handleCreer}>Créer</button>
          <button className="btn-outline" onClick={chargerListe}>Rafraîchir</button>
        </div>

        {/* Message de retour */}
        {msg && (
          <p style={{ marginTop: 10, fontSize: '0.88rem', fontWeight: 600,
            color: msg.startsWith('Erreur') ? 'var(--danger)' : 'var(--success)' }}>
            {msg}
          </p>
        )}
      </div>

      <hr />

      {/* Section : restaurer une sauvegarde */}
      <div className="card">
        <p className="section-title">Restaurer une sauvegarde</p>

        {/* Si aucune sauvegarde n'existe */}
        {sauvegardes.length === 0 ? (
          <div className="empty-state">
            <p>Aucune sauvegarde disponible. Crée-en une ci-dessus.</p>
          </div>
        ) : (
          <>
            <p className="text-muted" style={{ marginBottom: 12 }}>
              Clique sur une sauvegarde pour la sélectionner :
            </p>

            {/* Liste des sauvegardes cliquables */}
            {sauvegardes.map(s => (
              <div
                key={s}
                className={`backup-item ${selected === s ? 'selected' : ''}`}
                onClick={() => setSelected(s)}
              >
                {s}
              </div>
            ))}

            <div className="grid2" style={{ marginTop: 14 }}>
              {/* Mode de restauration */}
              <div>
                <label>Mode</label>
                <select value={mode} onChange={e => setMode(e.target.value)}>
                  <option value="replace">replace -- vider puis restaurer</option>
                  <option value="append">append -- ajouter aux existants</option>
                </select>
              </div>

              {/* Collections à restaurer (indépendant de la section créer) */}
              <div>
                <label>Collections à restaurer</label>
                <div className="chips">
                  {TOUTES_COLLECTIONS.map(col => (
                    <label key={col} className="chip">
                      <input
                        type="checkbox"
                        checked={collectionsRestaurer.includes(col)}
                        onChange={() => toggleColRestaurer(col)}
                      />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bouton désactivé si rien n'est sélectionné */}
            <button className="btn-outline" onClick={handleRestaurer} disabled={!selected}>
              Restaurer
            </button>
          </>
        )}
      </div>

    </div>
  )
}