import express from 'express'
import { MongoClient, BSON } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = 'mongolingo'
const PORT = 3001

const COLLECTIONS = ['users', 'orders', 'lessons']

// Connexion MongoDB
let db
async function getDb() {
  if (!db) {
    const client = new MongoClient(MONGO_URL)
    await client.connect()
    db = client.db(DB_NAME)
    console.log('MongoDB connecté')
  }
  return db
}

// Questions avec leurs solutions côté serveur
const QUESTIONS = [
  { id: 1,  col: 'users',   op: 'find',           args: [{}],                                                       opts: {} },
  { id: 2,  col: 'users',   op: 'countDocuments',  args: [{}],                                                       opts: {} },
  { id: 3,  col: 'users',   op: 'find',           args: [{ city: 'Paris' }],                                        opts: {} },
  { id: 4,  col: 'users',   op: 'find',           args: [{ status: 'active' }],                                     opts: {} },
  { id: 5,  col: 'users',   op: 'find',           args: [{}, { name: 1, email: 1, _id: 0 }],                        opts: {} },
  { id: 6,  col: 'users',   op: 'find',           args: [{ age: { $gt: 30 } }],                                     opts: {} },
  { id: 7,  col: 'users',   op: 'find',           args: [{ balance: { $gte: 100, $lte: 500 } }],                    opts: {} },
  { id: 8,  col: 'users',   op: 'find',           args: [{}],                                                       opts: { sort: { balance: -1 }, limit: 5 } },
  { id: 9,  col: 'orders',  op: 'find',           args: [{ status: 'paid' }],                                       opts: {} },
  { id: 10, col: 'users',   op: 'find',           args: [{ city: { $in: ['Paris', 'Lyon', 'Bordeaux'] } }],         opts: {} },
  { id: 11, col: 'orders',  op: 'countDocuments',  args: [{ status: 'pending' }],                                    opts: {} },
  { id: 12, col: 'users',   op: 'find',           args: [{ $and: [{ status: 'active' }, { age: { $gt: 25 } }] }],  opts: {} },
  { id: 13, col: 'users',   op: 'aggregate',      args: [[{ $group: { _id: '$city', count: { $sum: 1 } } }]],      opts: {} },
  { id: 14, col: 'orders',  op: 'aggregate',      args: [[{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]], opts: {} },
  { id: 15, col: 'users',   op: 'aggregate',      args: [[{ $group: { _id: '$city', avgBalance: { $avg: '$balance' } } }, { $sort: { avgBalance: -1 } }]], opts: {} },
  { id: 16, col: 'lessons', op: 'find',           args: [{ tags: 'aggregation' }],                                  opts: {} },
  { id: 17, col: 'orders',  op: 'aggregate',      args: [[{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } }, { $unwind: '$user' }, { $project: { _id: 1, amount: 1, status: 1, 'user.name': 1 } }]], opts: {} },
  { id: 18, col: 'orders',  op: 'aggregate',      args: [[{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]], opts: {} },
  { id: 19, col: 'users',   op: 'aggregate',      args: [[{ $group: { _id: '$city', totalBalance: { $sum: '$balance' } } }, { $sort: { totalBalance: -1 } }, { $limit: 3 }]], opts: {} },
  { id: 20, col: 'users',   op: 'aggregate',      args: [[{ $lookup: { from: 'orders', localField: '_id', foreignField: 'userId', as: 'orders' } }, { $match: { orders: { $size: 0 } } }, { $project: { name: 1, email: 1, _id: 0 } }]], opts: {} },
  { id: 21, col: 'users',   op: 'find',           args: [{ email: { $regex: '@gmail\\.com$', $options: 'i' } }],   opts: {} },
  { id: 22, col: 'users',   op: 'aggregate',      args: [[{ $addFields: { category: { $cond: { if: { $gt: ['$balance', 500] }, then: 'riche', else: 'normal' } } } }]], opts: {} },
  { id: 23, col: 'orders',  op: 'aggregate',      args: [[{ $group: { _id: '$userId', avgAmount: { $avg: '$amount' } } }, { $project: { userId: '$_id', avgAmount: 1, _id: 0 } }]], opts: {} },
  { id: 24, col: 'lessons', op: 'find',           args: [{ tags: { $all: ['mongodb', 'index'] } }],                 opts: {} },
  { id: 25, col: 'users',   op: 'aggregate',      args: [[{ $facet: { byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }], globalAvgBalance: [{ $group: { _id: null, avg: { $avg: '$balance' } } }] } }]], opts: {} },
  { id: 26, col: 'users',   op: 'aggregate',      args: [[{ $match: { status: 'active' } }, { $group: { _id: '$city', activeCount: { $sum: 1 }, totalBalance: { $sum: '$balance' }, avgBalance: { $avg: '$balance' } } }, { $sort: { activeCount: -1 } }]], opts: {} },
  { id: 27, col: 'users',   op: 'aggregate',      args: [[{ $lookup: { from: 'orders', let: { uid: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$userId', '$$uid'] }, { $eq: ['$status', 'paid'] }] } } }], as: 'paidOrders' } }, { $project: { name: 1, city: 1, paidCount: { $size: '$paidOrders' }, _id: 0 } }]], opts: {} },
  { id: 28, col: 'users',   op: 'aggregate',      args: [[{ $bucket: { groupBy: '$age', boundaries: [0, 21, 31, 41, 200], default: 'other', output: { count: { $sum: 1 }, names: { $push: '$name' } } } }]], opts: {} },
  { id: 29, col: 'lessons', op: 'aggregate',      args: [[{ $unwind: '$tags' }, { $group: { _id: '$tags', lessonCount: { $sum: 1 } } }, { $sort: { lessonCount: -1 } }]], opts: {} },
  { id: 30, col: 'users',   op: 'aggregate',      args: [[{ $match: { status: 'active' } }, { $lookup: { from: 'orders', localField: '_id', foreignField: 'userId', as: 'orders' } }, { $addFields: { orderCount: { $size: '$orders' }, totalSpent: { $sum: '$orders.amount' } } }, { $sort: { totalSpent: -1 } }, { $project: { _id: 0, name: 1, city: 1, orderCount: 1, totalSpent: 1 } }]], opts: {} },
]

// Exécuter une requête MongoDB
async function execQuery(database, op, colName, args, opts) {
  const col = database.collection(colName)
  if (op === 'countDocuments') return col.countDocuments(args[0] || {})
  if (op === 'aggregate') return col.aggregate(args[0] || []).toArray()
  if (op === 'findOne') return col.findOne(args[0] || {}, { projection: args[1] || {} })
  // find
  let cursor = col.find(args[0] || {}, { projection: args[1] || {} })
  if (opts.sort)  cursor = cursor.sort(opts.sort)
  if (opts.limit) cursor = cursor.limit(opts.limit)
  if (opts.skip)  cursor = cursor.skip(opts.skip)
  return cursor.toArray()
}

// Charger les données de démo
async function chargerDemoData(database) {
  const noms = []
  for (const nom of COLLECTIONS) {
    const fichier = path.join(ROOT, 'demo-data', nom + '.json')
    if (!fs.existsSync(fichier)) continue
    const docs = JSON.parse(fs.readFileSync(fichier, 'utf-8'))
    await database.collection(nom).deleteMany({})
    if (docs.length) await database.collection(nom).insertMany(docs)
    noms.push(nom)
  }
  return noms
}

const app = express()
app.use(express.json({ limit: '20mb' }))

// Servir le build React en prod
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) app.use(express.static(dist))

// GET /api/health
app.get('/api/health', async (req, res) => {
  try {
    const database = await getDb()
    await database.command({ ping: 1 })
    res.json({ ok: true, db: DB_NAME })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/questions — renvoie les métadonnées des questions
app.get('/api/questions', (req, res) => {
  const fichier = path.join(ROOT, 'server', 'questions-meta.json')
  if (!fs.existsSync(fichier)) return res.status(500).json({ error: 'questions-meta.json manquant' })
  res.json(JSON.parse(fs.readFileSync(fichier, 'utf-8')))
})

// POST /api/reset
app.post('/api/reset', async (req, res) => {
  try {
    const database = await getDb()
    const collections = await chargerDemoData(database)
    res.json({ ok: true, collections })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/execute
app.post('/api/execute', async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body
    const q = QUESTIONS.find(q => q.id === Number(questionId))
    if (!q) return res.status(404).json({ error: 'Question introuvable' })
    if (!COLLECTIONS.includes(userAnswer.collection)) return res.status(400).json({ error: 'Collection non autorisée' })

    const database = await getDb()

    let userResult
    try {
      userResult = await execQuery(database, userAnswer.operation, userAnswer.collection, userAnswer.args, userAnswer.options || {})
    } catch (e) {
      return res.status(400).json({ error: 'Erreur dans ta requête : ' + e.message })
    }

    const expectedResult = await execQuery(database, q.op, q.col, q.args, q.opts)
    const isCorrect = JSON.stringify(userResult) === JSON.stringify(expectedResult)

    res.json({ isCorrect, userResult, expectedResult })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/export/json
app.get('/api/export/json', async (req, res) => {
  const { collection } = req.query
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Collection non autorisée' })
  const database = await getDb()
  const docs = await database.collection(collection).find({}).toArray()
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(docs, null, 2))
})

// GET /api/export/bson
app.get('/api/export/bson', async (req, res) => {
  const { collection } = req.query
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Collection non autorisée' })
  const database = await getDb()
  const docs = await database.collection(collection).find({}).toArray()
  const buffers = docs.map(doc => BSON.serialize(doc))
  const merged = Buffer.concat(buffers)
  res.json({ base64: merged.toString('base64'), count: docs.length })
})

// POST /api/import/json
app.post('/api/import/json', async (req, res) => {
  try {
    const { collection, mode, jsonText } = req.body
    if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Collection non autorisée' })
    
    let docs
    try { docs = JSON.parse(jsonText) } catch { return res.status(400).json({ error: 'JSON invalide' }) }
    if (!Array.isArray(docs)) return res.status(400).json({ error: 'Doit être un tableau JSON' })
    
    const database = await getDb()
    const col = database.collection(collection)
    
    if (mode === 'replace') await col.deleteMany({})
    if (docs.length) await col.insertMany(docs)
    
    res.json({ ok: true, inserted: docs.length, mode })
  } catch (e) {
    res.status(400).json({ error: 'Erreur DB : ' + e.message })
  }
})

// POST /api/import/bson
app.post('/api/import/bson', async (req, res) => {
  try {
    const { collection, mode, base64 } = req.body
    if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Collection non autorisée' })
    
    const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    
    //Convertir en Buffer global
    const buffer = Buffer.from(cleanBase64, 'base64')
    const docs = []
    let offset = 0
    
    //Parcourir le Buffer BSON
    while (offset < buffer.length) {
      const size = buffer.readInt32LE(offset)
      
      // Sécurité 
      if (size <= 0 || offset + size > buffer.length) {
        throw new Error(`Taille de document invalide à l'offset ${offset}`);
      }
      
      //Extraire le document et forcer la création d'un Buffer propre pour la librairie BSON
      const docBuffer = Buffer.from(buffer.subarray(offset, offset + size));
      docs.push(BSON.deserialize(docBuffer))
      
      offset += size
    }
    
    const database = await getDb()
    const col = database.collection(collection)
    
    if (mode === 'replace') await col.deleteMany({})
    if (docs.length) await col.insertMany(docs)
    
    res.json({ ok: true, inserted: docs.length, mode })
  } catch (e) {
    console.error("Erreur import BSON:", e);
    res.status(400).json({ error: 'Erreur BSON : ' + e.message })
  }
})

// GET /api/backups
app.get('/api/backups', (req, res) => {
  const dir = path.join(ROOT, 'backups')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  const liste = fs.readdirSync(dir).filter(e => fs.statSync(path.join(dir, e)).isDirectory())
  res.json({ backups: liste.sort().reverse() })
})

// POST /api/backups
app.post('/api/backups', async (req, res) => {
  const { label = 'backup', collections = COLLECTIONS } = req.body
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dirName = `${timestamp}_${label}`
  const dirPath = path.join(ROOT, 'backups', dirName)
  fs.mkdirSync(dirPath, { recursive: true })
  const database = await getDb()
  for (const nom of collections) {
    if (!COLLECTIONS.includes(nom)) continue
    const docs = await database.collection(nom).find({}).toArray()
    fs.writeFileSync(path.join(dirPath, nom + '.json'), JSON.stringify(docs, null, 2))
    const merged = Buffer.concat(docs.map(d => BSON.serialize(d)))
    fs.writeFileSync(path.join(dirPath, nom + '.bson.b64.txt'), merged.toString('base64'))
  }
  res.json({ ok: true, dir: dirName })
})

// POST /api/backups/restore
app.post('/api/backups/restore', async (req, res) => {
  const { backupName, mode = 'replace', collections = COLLECTIONS } = req.body
  const dirPath = path.join(ROOT, 'backups', backupName)
  if (!fs.existsSync(dirPath)) return res.status(404).json({ error: 'Backup introuvable' })
  const database = await getDb()
  for (const nom of collections) {
    const fichier = path.join(dirPath, nom + '.json')
    if (!fs.existsSync(fichier)) continue
    const docs = JSON.parse(fs.readFileSync(fichier, 'utf-8'))
    const col = database.collection(nom)
    if (mode === 'replace') await col.deleteMany({})
    if (docs.length) await col.insertMany(docs)
  }
  res.json({ ok: true })
})

// Fallback SPA
app.get('*', (req, res) => {
  const index = path.join(dist, 'index.html')
  if (fs.existsSync(index)) res.sendFile(index)
  else res.status(404).send('Lancez npm run build pour construire le frontend')
})

// Démarrage
app.listen(PORT, async () => {
  console.log(`Serveur démarré : http://localhost:${PORT}`)
  try {
    const database = await getDb()
    // Charger les données si les collections sont vides
    const count = await database.collection('users').countDocuments()
    if (count === 0) {
      console.log('Collections vides — chargement des données de démo...')
      await chargerDemoData(database)
      console.log('Données chargées !')
    }
  } catch (e) {
    console.warn('MongoDB non disponible au démarrage :', e.message)
  }
})
