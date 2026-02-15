import { sql } from './db.js';

export async function handler(event) {
  const method = event.httpMethod;

  try {
    // GET : Récupérer les données
    if (method === 'GET') {
      const data = await sql`SELECT * FROM measurements ORDER BY date DESC`;
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // POST : Ajouter une mesure
    if (method === 'POST') {
      const b = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO measurements (date, cou, epaules, pectoraux, taille, cuisses, bras, poids)
        VALUES (${b.date}, ${b.cou}, ${b.epaules}, ${b.pectoraux}, ${b.taille}, ${b.cuisses}, ${b.bras}, ${b.poids})
        RETURNING *
      `;
      return { statusCode: 201, body: JSON.stringify(result[0]) };
    }

    // PUT : Modifier une mesure
    if (method === 'PUT') {
      const b = JSON.parse(event.body);
      const result = await sql`
        UPDATE measurements
        SET cou=${b.cou}, epaules=${b.epaules}, pectoraux=${b.pectoraux}, 
            taille=${b.taille}, cuisses=${b.cuisses}, bras=${b.bras}, poids=${b.poids}
        WHERE id=${b.id}
        RETURNING *
      `;
      return { statusCode: 200, body: JSON.stringify(result[0]) };
    }

    // DELETE : Supprimer
    if (method === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await sql`DELETE FROM measurements WHERE id=${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Supprimé' }) };
    }

    return { statusCode: 405, body: 'Méthode non autorisée' };

  } catch (error) {
    console.error("Erreur backend:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}