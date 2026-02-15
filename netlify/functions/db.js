import { neon } from '@netlify/neon';

const sql = neon(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL);

export async function handler(event) {
  // Optionnel : Gérer les requêtes OPTIONS (CORS) si tu appelles l'API depuis un autre domaine
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE" } };
  }

  try {
    const method = event.httpMethod;

    // GET : Récupérer les données
    if (method === 'GET') {
      const data = await sql`SELECT * FROM measurements ORDER BY date DESC`;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
    }

    // POST : Ajouter
    if (method === 'POST') {
      const b = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO measurements (date, poids, cou, epaules, pectoraux, taille, cuisses, bras)
        VALUES (${b.date}, ${b.poids}, ${b.cou}, ${b.epaules}, ${b.pectoraux}, ${b.taille}, ${b.cuisses}, ${b.bras})
        RETURNING *
      `;
      return { statusCode: 201, body: JSON.stringify(result[0]) };
    }

    // DELETE : Supprimer
    if (method === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await sql`DELETE FROM measurements WHERE id=${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Supprimé' }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };

  } catch (error) {
    console.error("Erreur SQL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}