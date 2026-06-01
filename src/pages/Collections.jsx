/**
 * Collections.jsx -> Documentation des collections MongoDB
 *
 * Page statique (pas de useState ni de fetch).
 * Présente les 3 collections utilisées dans le quiz :
 * users -> utilisateurs avec infos personnelles et financières
 * orders -> commandes liées aux utilisateurs (relation par userId)
 * lessons -> leçons avec tags (tableau) pour pratiquer $unwind/$all
 *
 * @author M.Weis
 * Projet Final - R4.03
 * Groupe C1
 */

export default function Collections() {
  return (
    <div>

      {/* Titre de la page */}
      <div className="page-hero">
        <h1>Collections</h1>
        <p>Schémas et données de démo des 3 collections MongoDB</p>
      </div>

      {/* Collection users */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <p className="section-title">users</p>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          30 utilisateurs avec infos personnelles et financières.
          Fichiers : <code>demo-data/users.json</code> · <code>schemas/users.schema.json</code>
        </p>

        {/* Champs de la collection */}
        <div className="field-row"><span className="field-name">_id</span>    <span className="field-type">string</span> <span className="field-desc">Identifiant unique, ex: "user_1"</span></div>
        <div className="field-row"><span className="field-name">name</span>   <span className="field-type">string</span> <span className="field-desc">Nom complet</span></div>
        <div className="field-row"><span className="field-name">email</span>  <span className="field-type">string</span> <span className="field-desc">Adresse email</span></div>
        <div className="field-row"><span className="field-name">age</span>    <span className="field-type">number</span> <span className="field-desc">Âge entre 18 et 65</span></div>
        <div className="field-row"><span className="field-name">city</span>   <span className="field-type">string</span> <span className="field-desc">Paris, Lyon, Bordeaux, Toulouse ou Nice</span></div>
        <div className="field-row"><span className="field-name">status</span> <span className="field-type">string</span> <span className="field-desc">"active", "inactive" ou "banned"</span></div>
        <div className="field-row"><span className="field-name">balance</span><span className="field-type">number</span> <span className="field-desc">Solde en euros (0 à 1000)</span></div>

        {/* Exemple de document */}
        <pre style={{ marginTop: 14 }}>{`{ "_id": "user_1", "name": "Alice Martin", "email": "alice@gmail.com",
  "age": 28, "city": "Paris", "status": "active", "balance": 342.5 }`}</pre>
      </div>

      {/* Collection orders */}
      <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <p className="section-title">orders</p>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          50 commandes liées aux utilisateurs via userId.
          Fichiers : <code>demo-data/orders.json</code> · <code>schemas/orders.schema.json</code>
        </p>

        {/* Champs de la collection */}
        <div className="field-row"><span className="field-name">_id</span>    <span className="field-type">string</span> <span className="field-desc">Identifiant unique, ex: "order_1"</span></div>
        <div className="field-row"><span className="field-name">userId</span> <span className="field-type">string</span> <span className="field-desc">Référence vers users._id</span></div>
        <div className="field-row"><span className="field-name">amount</span> <span className="field-type">number</span> <span className="field-desc">Montant en euros</span></div>
        <div className="field-row"><span className="field-name">status</span> <span className="field-type">string</span> <span className="field-desc">"paid", "pending" ou "cancelled"</span></div>
        <div className="field-row"><span className="field-name">date</span>   <span className="field-type">string</span> <span className="field-desc">Date ISO 8601</span></div>

        {/* Exemple de document */}
        <pre style={{ marginTop: 14 }}>{`{ "_id": "order_1", "userId": "user_1", "amount": 49.99,
  "status": "paid", "date": "2024-01-05T10:00:00Z" }`}</pre>

        {/* Relation entre collections : orders.userId référence users._id */}
        <p className="text-muted" style={{ marginTop: 12, fontSize: '0.85rem' }}>
          Relation : <code>orders.userId</code> référence <code>users._id</code> -- jointure avec <code>$lookup</code>
        </p>
      </div>

      {/* Collection lessons */}
      <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
        <p className="section-title">lessons</p>
        <p className="text-muted" style={{ marginBottom: 14 }}>
          30 leçons avec des tags (tableau). Utilisées pour pratiquer <code>$unwind</code> et <code>$all</code>.
          Fichiers : <code>demo-data/lessons.json</code> · <code>schemas/lessons.schema.json</code>
        </p>

        {/* Champs de la collection */}
        <div className="field-row"><span className="field-name">_id</span>        <span className="field-type">string</span> <span className="field-desc">Identifiant, ex: "lesson_1"</span></div>
        <div className="field-row"><span className="field-name">title</span>      <span className="field-type">string</span> <span className="field-desc">Titre de la leçon</span></div>
        <div className="field-row"><span className="field-name">difficulty</span> <span className="field-type">string</span> <span className="field-desc">"beginner", "intermediate" ou "advanced"</span></div>
        {/* tags est un tableau : permet d'utiliser $unwind et $all dans les requêtes */}
        <div className="field-row"><span className="field-name">tags</span>       <span className="field-type">array</span>  <span className="field-desc">Liste de mots-clés, ex: ["mongodb", "aggregation"]</span></div>

        {/* Exemple de document */}
        <pre style={{ marginTop: 14 }}>{`{ "_id": "lesson_1", "title": "Introduction à l'agrégation",
  "difficulty": "intermediate", "tags": ["mongodb", "aggregation", "pipeline"] }`}</pre>
      </div>

    </div>
  )
}