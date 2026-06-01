/**
 * client.js -> Fonctions pour communiquer avec le serveur
 *
 * Regroupe toutes les requêtes HTTP vers l'API Express.
 * Chaque fonction utilise fetch() et retourne les données JSON.
 * En cas d'erreur HTTP (status != 200), une exception est levée.
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

/**
 * Envoie une requête HTTP et vérifie le statut de la réponse.
 * Lance une exception si le serveur répond avec une erreur (404, 500).
 * @param {string} url - L'URL de la requête
 * @param {object} options - Options fetch (method, headers, body)
 */
async function req(url, options = {}) {
  const res = await fetch(url, options)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }

  return res
}

// Santé de l'API 

// Vérifie que le serveur et MongoDB sont bien connectés
export async function getHealth() {
  return (await req('/api/health')).json()
}

// Données de démonstration 

// Recharge les données de démo dans MongoDB (users, orders, lessons)
export async function resetData() {
  return (await req('/api/reset', { method: 'POST' })).json()
}

// Questions du quiz 

// Récupère la liste de toutes les questions depuis questions-meta.json
export async function getQuestions() {
  return (await req('/api/questions')).json()
}

/**
 * Soumet la réponse de l'utilisateur pour une question donnée.
 * @param {number} questionId - L'id de la question (ex: 3)
 * @param {object} userAnswer - { operation, collection, args, options }
 */
export async function executer(questionId, userAnswer) {
  return (await req('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, userAnswer }),
  })).json()
}

// Export de données 

// Exporte une collection au format JSON (texte brut)
export async function exporterJson(collection) {
  return (await req(`/api/export/json?collection=${collection}`)).text()
}

// Exporte une collection au format BSON encodé en base64
export async function exporterBson(collection) {
  return (await req(`/api/export/bson?collection=${collection}`)).json()
}

// Import de données 

/**
 * Importe un tableau JSON dans une collection.
 * @param {string} collection - Nom de la collection cible
 * @param {string} mode - 'replace' (vider puis insérer) ou 'append' (ajouter)
 * @param {string} jsonText - Le contenu JSON à importer
 */
export async function importerJson(collection, mode, jsonText) {
  return (await req('/api/import/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, mode, jsonText }),
  })).json()
}

/**
 * Importe des données BSON encodées en base64 dans une collection.
 * @param {string} collection - Nom de la collection cible
 * @param {string} mode - 'replace' ou 'append'
 * @param {string} base64 - Le contenu BSON encodé en base64
 */
export async function importerBson(collection, mode, base64) {
  return (await req('/api/import/bson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, mode, base64 }),
  })).json()
}

// Sauvegardes 

// Récupère la liste des sauvegardes disponibles dans le dossier backups/
export async function listerSauvegardes() {
  return (await req('/api/backups')).json()
}

/**
 * Crée une nouvelle sauvegarde.
 * @param {string} label - Label de la sauvegarde (ex: "avant-import")
 * @param {string[]} collections - Collections à sauvegarder
 */
export async function creerSauvegarde(label, collections) {
  return (await req('/api/backups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, collections }),
  })).json()
}

/**
 * Restaure une sauvegarde existante dans MongoDB.
 * @param {string} backupName - Nom du dossier de la sauvegarde
 * @param {string} mode - 'replace' ou 'append'
 * @param {string[]} collections - Collections à restaurer
 */
export async function restaurerSauvegarde(backupName, mode, collections) {
  return (await req('/api/backups/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backupName, mode, collections }),
  })).json()
}