/**
 * Quiz.jsx -> Page principale du quiz MongoDB
 *
 * Gère toute la logique du quiz :
 * 1. Chargement des questions depuis l'API au démarrage
 * 2. Sélection du niveau (débutant -> très complexe)
 * 3. QCM pour les niveaux débutant et intermédiaire
 * 4. Saisie libre pour les niveaux avancé, expert et très complexe
 * 5. Soumission -> exécution réelle sur MongoDB -> feedback avec explication
 *
 * Hooks utilisés :
 * useState  -> tous les états du quiz (index, score, réponse, résultat...)
 * useEffect -> charge les questions au montage du composant
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

import { useEffect, useState } from 'react'
import { getQuestions, executer } from '../api/client.js'

/**
 * Badge -> Affiche un badge coloré selon le niveau de la question.
 * @param {string} level - Niveau de la question (ex: "débutant")
 */
function Badge({ level }) {
  const classes = {
    'débutant': 'badge-debutant',
    'intermédiaire': 'badge-intermediaire',
    'avancé': 'badge-avance',
    'expert': 'badge-expert',
    'très complexe': 'badge-complexe',
  }
  return <span className={`badge ${classes[level] || ''}`}>{level}</span>
}


// Informations sur les collections (pour guider l'utilisateur)
const INFO_COLLECTIONS = {
  users: [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'age', type: 'number' },
    { name: 'city', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'balance', type: 'number' },
  ],
  orders: [
    { name: '_id', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'amount', type: 'number' },
    { name: 'status', type: 'string' },
    { name: 'date', type: 'string' },
  ],
  lessons: [
    { name: '_id',type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'difficulty', type: 'string' },
    { name: 'tags', type: 'array'  },
  ],
}

// Niveaux pour lesquels on affiche un QCM (les autres utilisent la saisie libre)
const NIVEAUX_QCM = ['débutant', 'intermédiaire']

// Mauvaises réponses pour chaque question QCM, indexées par id
// Plausibles mais incorrectes pour aider l'utilisateur à repérer les différences
const MAUVAISES_REPONSES = {
  // Débutant 
  1:  ['db.users.find({ name: "Alice" })', 'db.orders.find({})', 'db.users.findOne({})'],
  2:  ['db.users.find({}).count()', 'db.users.aggregate([])', 'db.orders.countDocuments({})'],
  3:  ['db.users.find({ city: "Lyon" })', 'db.users.find({ name: "Paris" })', 'db.users.find({ country: "Paris" })'],
  4:  ['db.users.find({ status: "inactive" })', 'db.users.find({ active: true })', 'db.users.find({ status: "banned" })'],
  5:  ['db.users.find({}, { name: 1, email: 1 })', 'db.users.find({}, { _id: 0 })', 'db.users.find({}, { name: 0, email: 0 })'],
  31: ['db.users.find({})', 'db.lessons.find({})', 'db.orders.findOne({})'],
  32: ['db.users.find({})', 'db.orders.find({})', 'db.lessons.findOne({})'],
  33: ['db.orders.find({}).count()', 'db.users.countDocuments({})', 'db.orders.aggregate([])'],
  34: ['db.lessons.find({}).count()', 'db.users.countDocuments({})', 'db.orders.countDocuments({})'],
  35: ['db.users.find({ city: "Paris" })', 'db.users.find({ city: "Bordeaux" })', 'db.users.find({ name: "Lyon" })'],
  36: ['db.users.find({ city: "Paris" })', 'db.users.find({ city: "Lyon" })', 'db.users.find({ city: "Bordeaux" })'],
  37: ['db.users.find({ status: "active" })', 'db.users.find({ status: "banned" })', 'db.users.find({ active: false })'],
  38: ['db.users.find({ status: "inactive" })', 'db.users.find({ status: "active" })', 'db.users.find({ banned: true })'],
  39: ['db.orders.find({ status: "pending" })', 'db.orders.find({ status: "paid" })', 'db.users.find({ status: "cancelled" })'],
  40: ['db.users.find({})', 'db.users.find({}).limit(1)', 'db.users.aggregate([{ $limit: 1 }])'],
  41: ['db.users.find({}, { name: 1 })', 'db.users.find({}, { _id: 0 })', 'db.users.find({}, { name: 0, _id: 0 })'],
  42: ['db.orders.find({}, { amount: 1 })', 'db.orders.find({}, { _id: 0 })', 'db.orders.find({}, { amount: 0, status: 0 })'],
  43: ['db.users.countDocuments({ status: "active" })', 'db.users.find({ status: "inactive" }).count()', 'db.users.countDocuments({ inactive: true })'],
  44: ['db.users.countDocuments({ status: "active" })', 'db.users.find({ status: "banned" }).count()', 'db.users.countDocuments({ banned: true })'],
  45: ['db.lessons.find({ difficulty: "advanced" })', 'db.lessons.find({ level: "beginner" })', 'db.lessons.find({ difficulty: "intermediate" })'],
  // Intermédiaire 
  6:  ['db.users.find({ age: { $lt: 30 } })', 'db.users.find({ age: 30 })', 'db.users.find({ age: { $gte: 30 } })'],
  7:  ['db.users.find({ balance: { $gt: 100, $lt: 500 } })', 'db.users.find({ balance: { $gte: 100 } })', 'db.users.find({ balance: { $between: [100, 500] } })'],
  8:  ['db.users.find({}).sort({ balance: 1 }).limit(5)', 'db.users.find({}).limit(5)', 'db.users.find({}).sort({ name: -1 }).limit(5)'],
  9:  ['db.orders.find({ status: "pending" })', 'db.orders.find({ status: "cancelled" })', 'db.users.find({ status: "paid" })'],
  10: ['db.users.find({ city: { $or: ["Paris", "Lyon"] } })', 'db.users.find({ city: "Paris" })', 'db.users.find({ city: { $nin: ["Paris", "Lyon", "Bordeaux"] } })'],
  11: ['db.orders.countDocuments({ status: "paid" })', 'db.orders.find({ status: "pending" }).count()', 'db.users.countDocuments({ status: "pending" })'],
  12: ['db.users.find({ status: "active", age: { $gt: 25 } })', 'db.users.find({ $or: [{ status: "active" }, { age: { $gt: 25 } }] })', 'db.users.find({ $and: [{ status: "inactive" }, { age: { $gt: 25 } }] })'],
  46: ['db.users.find({ age: { $gt: 25 } })', 'db.users.find({ age: 25 })', 'db.users.find({ age: { $lte: 25 } })'],
  47: ['db.users.find({ balance: { $lt: 500 } })', 'db.users.find({ balance: 500 })', 'db.users.find({ balance: { $gte: 500 } })'],
  48: ['db.users.find({ balance: { $gt: 100 } })', 'db.users.find({ balance: 100 })', 'db.users.find({ balance: { $gte: 100 } })'],
  49: ['db.users.find({ age: { $gt: 25, $lt: 40 } })', 'db.users.find({ age: { $gte: 25 } })', 'db.users.find({ age: { $between: [25, 40] } })'],
  50: ['db.users.find({ status: "active" })', 'db.users.find({ status: { $eq: "active" } })', 'db.users.find({ status: { $nin: ["active"] } })'],
  51: ['db.users.find({ city: { $in: ["Paris", "Lyon"] } })', 'db.users.find({ city: { $ne: "Paris" } })', 'db.users.find({ city: { $not: "Paris" } })'],
  52: ['db.users.find({}).sort({ name: -1 }).limit(5)', 'db.users.find({}).limit(5)', 'db.users.find({}).sort({ age: 1 }).limit(5)'],
  53: ['db.orders.find({}).sort({ amount: 1 }).limit(3)', 'db.orders.find({}).limit(3)', 'db.orders.find({}).sort({ status: -1 }).limit(3)'],
  54: ['db.users.countDocuments({ balance: { $lt: 300 } })', 'db.users.find({ balance: { $gt: 300 } }).count()', 'db.users.countDocuments({ balance: 300 })'],
  55: ['db.orders.countDocuments({ amount: { $lt: 200 } })', 'db.orders.find({ amount: { $gt: 200 } }).count()', 'db.orders.countDocuments({ amount: 200 })'],
  56: ['db.users.find({ $and: [{ age: { $lt: 20 } }, { age: { $gt: 50 } }] })', 'db.users.find({ age: { $lt: 20 } })', 'db.users.find({ age: { $gt: 50 } })'],
  57: ['db.users.find({ status: "active" })', 'db.users.find({ status: { $nin: ["active", "inactive"] } })', 'db.users.find({ $or: [{ status: "active" }, { status: "inactive" }] })'],
  58: ['db.orders.find({ amount: { $gt: 100, $lt: 300 } })', 'db.orders.find({ amount: { $gte: 100 } })', 'db.orders.find({ amount: { $between: [100, 300] } })'],
  59: ['db.users.find({ $or: [{ status: "active" }, { city: "Paris" }] })', 'db.users.find({ status: "active" })', 'db.users.find({ city: "Paris" })'],
  60: ['db.lessons.find({ difficulty: "beginner" })', 'db.lessons.find({ difficulty: "advanced" })', 'db.lessons.find({ level: "intermediate" })'],
  61: ['db.lessons.find({ tags: "aggregate" })', 'db.lessons.find({ tag: "index" })', 'db.lessons.find({ tags: { $in: ["index"] } })'],
  62: ['db.orders.find({ status: "paid" }).limit(5)', 'db.orders.find({ status: "paid" }).sort({ amount: 1 }).limit(5)', 'db.orders.find({}).sort({ amount: -1 }).limit(5)'],
  63: ['db.users.find({ age: { $lte: 40 } })', 'db.users.find({ age: 40 })', 'db.users.find({ age: { $gt: 40 } })'],
}

// Ordre d'affichage des niveaux dans le menu de sélection
const NIVEAUX = ['tous', 'débutant', 'intermédiaire', 'avancé', 'expert', 'très complexe']

// Mélange aléatoirement un tableau
function melanger(tab) {
  return [...tab].sort(() => Math.random() - 0.5)
}

/**
 * Retourne les 4 propositions (1 bonne + 3 mauvaises) mélangées pour une question.
 * @param {object} question - La question courante
 */
function getPropositions(question) {
  const mauvaises = MAUVAISES_REPONSES[question.id] || [
    'db.' + question.collection + '.find({ status: "inactive" })',
    'db.' + question.collection + '.findOne({})',
    'db.' + question.collection + '.aggregate([])',
  ]
  return melanger([question.solution, ...mauvaises.slice(0, 3)])
}

/**
 * Transforme une requête shell MongoDB en objet structuré.
 * @param {string} requete - La requête saisie par l'utilisateur
 */
function parseRequeteShell(requete) {
  requete = requete.trim()

  // Cas 1 : aggregate([...])
  if (requete.includes('.aggregate(')) {
    const match = requete.match(/\.aggregate\((\[[\s\S]*\])\)/)
    if (!match) throw new Error('Format invalide. Ex: db.users.aggregate([...])')
    return { operation: 'aggregate', args: JSON.parse(match[1]), options: {} }
  }

  // Cas 2 : countDocuments({...})
  if (requete.includes('.countDocuments(')) {
    const match = requete.match(/\.countDocuments\((\{[\s\S]*?\})\)/)
    return { operation: 'countDocuments', args: [match ? JSON.parse(match[1].replace(/(\b[$\w]+\b)\s*:/g, '"$1":')) : {}], options: {} }
  }

  // Cas 3 : findOne({...})
  if (requete.includes('.findOne(')) {
    const match = requete.match(/\.findOne\((\{[\s\S]*?\})\)/)
    return { operation: 'findOne', args: [match ? JSON.parse(match[1].replace(/(\b[$\w]+\b)\s*:/g, '"$1":')) : {}], options: {} }
  }

  // Cas 4 : find({filtre}, {projection}).sort({}).limit(n)
  if (requete.includes('.find(')) {
    const options = {}

    const sortMatch = requete.match(/\.sort\((\{[\s\S]*?\})\)/)
    if (sortMatch) options.sort = JSON.parse(sortMatch[1].replace(/(\b[$\w]+\b)\s*:/g, '"$1":'))

    const limitMatch = requete.match(/\.limit\((\d+)\)/)
    if (limitMatch) options.limit = parseInt(limitMatch[1])

    const findMatch = requete.match(/\.find\(([\s\S]*?)\)(?:\.|$)/)
    if (!findMatch) throw new Error('Format invalide. Ex: db.users.find({ city: "Paris" })')

    let contenu = findMatch[1].trim()
    let filtre = {}, projection = {}

    if (contenu && contenu.startsWith('{')) {
      // Compte l'imbrication des accolades pour trouver la fin du premier objet
      let profondeur = 0
      let finPremier = -1
      for (let i = 0; i < contenu.length; i++) {
        if (contenu[i] === '{') profondeur++
        if (contenu[i] === '}') {
          profondeur--
          if (profondeur === 0) { finPremier = i; break }
        }
      }
      // JSON.parse n'accepte pas les clés sans guillemets (format shell MongoDB)
      function toJson(s) {
        return s.replace(/(?<!["'\w])([$]?[a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, (match, key) => {
          return JSON.stringify(key) + ':'
        })
      }
      filtre = JSON.parse(toJson(contenu.slice(0, finPremier + 1)))
      const reste = contenu.slice(finPremier + 1).replace(/^,\s*/, '')
      if (reste.startsWith('{')) projection = JSON.parse(toJson(reste))
    }

    return { operation: 'find', args: [filtre, projection], options }
  }

  throw new Error('Requête non reconnue. Ex: db.users.find({}) ou db.users.aggregate([...])')
}

// Extrait le nom de la collection depuis la requête
function extraireCollection(requete) {
  const match = requete.match(/db\.(\w+)\./)
  return match ? match[1] : 'users'
}

/**
 * EcranChoixNiveau -> Affiche le menu de sélection du niveau.
 * @param {function} onChoisir - Callback appelé avec le niveau choisi
 */
function EcranChoixNiveau({ onChoisir }) {
  return (
    <div className="card" style={{ maxWidth: 480, width: '100%' }}>
      <p className="section-title">Choisir un niveau</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NIVEAUX.map(n => (
          <button key={n} className="btn-outline" onClick={() => onChoisir(n)} style={{ textAlign: 'left' }}>
            {n === 'tous' ? 'Tous les niveaux' : n.charAt(0).toUpperCase() + n.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Quiz() {

  const [toutesQuestions, setToutesQuestions] = useState([])   // Toutes les questions chargées
  const [questions, setQuestions]             = useState([])   // Questions filtrées par niveau
  const [phase, setPhase]                     = useState('choix') // 'choix' ou 'quiz'
  const [index, setIndex]                     = useState(0)    // Index de la question courante
  const [score, setScore]                     = useState(0)    // Nombre de bonnes réponses
  const [chargement, setChargement]           = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [fini, setFini]                       = useState(false)   // Quiz terminé
  const [propositions, setPropositions]       = useState([])   // 4 propositions QCM
  const [choix, setChoix]                     = useState(null) // Proposition choisie
  const [requete, setRequete]                 = useState('')   // Saisie libre
  const [resultat, setResultat]               = useState(null) // Retour de l'API
  const [erreur, setErreur]                   = useState('')   // Message d'erreur
  const [envoi, setEnvoi]                     = useState(false)   // Appel API en cours
  const [niveauChoisi, setNiveauChoisi]       = useState('tous')

  // Charge les questions une seule fois au montage du composant
  useEffect(() => {
    getQuestions()
      .then(data => { setToutesQuestions(data); setChargement(false) })
      .catch(e   => { setErreurChargement(e.message); setChargement(false) })
  }, [])

  // Démarre le quiz pour le niveau choisi
  function demarrerNiveau(niveau) {
    const filtre = niveau === 'tous'
      ? toutesQuestions
      : toutesQuestions.filter(q => q.level === niveau)

    setNiveauChoisi(niveau)
    setQuestions(filtre)
    setIndex(0); setScore(0); setFini(false)
    setResultat(null); setErreur(''); setChoix(null); setRequete('')
    if (filtre.length > 0) setPropositions(getPropositions(filtre[0]))
    setPhase('quiz')
  }

  const question = questions[index]
  const estQCM   = question && NIVEAUX_QCM.includes(question.level)

  // Soumet une requête au serveur pour évaluation
  async function soumettre(req) {
    setErreur(''); setEnvoi(true)
    try {
      const parsed     = parseRequeteShell(req)
      const collection = extraireCollection(req)
      const res = await executer(question.id, {
        operation: parsed.operation, collection,
        args: parsed.args, options: parsed.options
      })
      setResultat(res)
      if (res.isCorrect) setScore(s => s + 1)
    } catch (e) {
      setErreur(e.message)
    }
    setEnvoi(false)
  }

  // Appelée quand l'utilisateur clique sur une proposition QCM
  function choisirProposition(prop) {
    if (resultat) return
    setChoix(prop)
    soumettre(prop)
  }

  // Appelée quand l'utilisateur soumet en saisie libre
  function soumettreLibre() {
    if (!requete.trim()) { setErreur('Écris une requête avant de soumettre.'); return }
    soumettre(requete.trim())
  }

  // Passe à la question suivante ou termine le quiz
  function questionSuivante() {
    if (index >= questions.length - 1) { setFini(true); return }
    const prochaine = questions[index + 1]
    setIndex(i => i + 1)
    setPropositions(getPropositions(prochaine))
    setChoix(null); setRequete(''); setResultat(null); setErreur('')
  }

  // Retourne à l'écran de sélection du niveau
  function recommencer() {
    setPhase('choix'); setFini(false)
    setResultat(null); setErreur(''); setChoix(null); setRequete('')
  }

  // Bloc hero commun à tous les écrans
  const hero = (
    <div className="page-hero">
      <h1>Quiz MongoDB</h1>
      <p>Teste tes connaissances sur les requêtes MongoDB, du niveau débutant au très complexe</p>
    </div>
  )

  if (chargement) return (
    <div>{hero}<div className="empty-state"><p>Chargement des questions...</p></div></div>
  )

  if (erreurChargement) return (
    <div>{hero}
      <div className="card">
        <p className="text-danger">{erreurChargement}</p>
        <p className="text-muted" style={{ marginTop: 6, fontSize: '0.85rem' }}>
          Vérifiez que le serveur tourne sur le port 3001.
        </p>
      </div>
    </div>
  )

  if (phase === 'choix') return (
    <div>{hero}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <EcranChoixNiveau onChoisir={demarrerNiveau} />
      </div>
    </div>
  )

  const progression = Math.round((index / questions.length) * 100)

  // Écran de fin
  if (fini) {
    const pct = Math.round(score / questions.length * 100)
    return (
      <div>{hero}
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          {niveauChoisi !== 'tous' && (
            <p className="text-muted" style={{ marginBottom: 8, fontSize: '0.85rem' }}>{niveauChoisi}</p>
          )}
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            {score}/{questions.length}
          </div>
          <p className="text-muted" style={{ marginTop: 8, fontSize: '1rem' }}>
            {pct}% de bonnes réponses
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button className="btn-outline" onClick={recommencer}>Changer de niveau</button>
            <button className="btn-primary"  onClick={() => demarrerNiveau(niveauChoisi)}>Recommencer</button>
          </div>
        </div>
      </div>
    )
  }

  // Rendu principal du quiz
  return (
    <div>
      {/* Barre de progression + score */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
          <span>
            Question {index + 1} / {questions.length}
            {niveauChoisi !== 'tous' ? ` - ${niveauChoisi}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Score : <strong style={{ color: 'var(--primary)' }}>{score}</strong></span>
            <button onClick={recommencer}
              style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
              title="Changer de niveau">
              niveaux
            </button>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: progression + '%' }} />
        </div>
      </div>

      {/* Carte de la question */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Badge level={question.level} />
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
          {question.title}
        </div>
        <p className="text-muted" style={{ marginBottom: 20 }}>{question.instruction}</p>

        {/* Mode QCM : propositions avant réponse */}
        {estQCM && !resultat && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Choisis la bonne requête :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {propositions.map((prop, i) => (
                <button key={i} className={`proposition ${choix === prop ? 'selected-choice' : ''}`} onClick={() => choisirProposition(prop)} disabled={envoi}>
                  {prop}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode QCM : affichage coloré après réponse */}
        {estQCM && resultat && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {propositions.map((prop, i) => {
              const estBonne   = prop === question.solution
              const estChoisie = prop === choix
              let cls = 'proposition'
              if (estBonne)        cls += ' correct-choice'
              else if (estChoisie) cls += ' wrong-choice'
              return <div key={i} className={cls} style={{ cursor: 'default' }}>{prop}</div>
            })}
          </div>
        )}

        {/* Mode saisie libre (niveaux avancé et plus) */}
        {!estQCM && !resultat && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Écris la requête MongoDB :
            </div>
            <textarea
              rows={4}
              value={requete}
              onChange={e => setRequete(e.target.value)}
              placeholder={'db.' + question.collection + '.find({ ... })'}
            />
            <button className="btn-primary" onClick={soumettreLibre} disabled={envoi}>
              {envoi ? 'Exécution...' : 'Soumettre'}
            </button>
          </div>
        )}

        {erreur && <p className="text-danger" style={{ marginTop: 10, fontSize: '0.88rem' }}>{erreur}</p>}
      </div>

      {/* Feedback après soumission */}
      {resultat && (
        <div className={`feedback ${resultat.isCorrect ? 'correct' : 'incorrect'}`}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>
            {resultat.isCorrect ? 'Correct !' : 'Incorrect'}
          </div>
          <div className="explication">
            <div style={{ marginBottom: 6 }}>
              <strong>Solution :</strong> <code>{question.solution}</code>
            </div>
            <div>{question.explanation}</div>
          </div>
          {/* Comparaison des résultats en saisie libre uniquement */}
          {!estQCM && (
            <div className="grid2" style={{ marginTop: 14 }}>
              <div>
                <label>Ta réponse</label>
                <pre>{JSON.stringify(resultat.userResult, null, 2)}</pre>
              </div>
              <div>
                <label>Résultat attendu</label>
                <pre>{JSON.stringify(resultat.expectedResult, null, 2)}</pre>
              </div>
            </div>
          )}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={questionSuivante}>
              Question suivante
            </button>
          </div>
        </div>
      )}

    </div>
  )
}