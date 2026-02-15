import { sql } from './db.js';
import fs from 'fs';
import path from 'path';

export const handler = async () => {
  try {
    // Chemin vers ton fichier CSV local (pendant build)
    const csvPath = path.resolve('./weights.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    const rows = csvData
      .split('\n')
      .slice(1) // ignorer l'entête
      .map(line => line.split(/\t|,/)) // tab ou virgule
      .map(([date, poids, moyenne]) => ({
        date,
        poids: parseFloat(poids)
      }));

    // Insérer chaque ligne dans la DB
    for (const row of rows) {
      await sql`
        INSERT INTO measurements(date, poids)
        VALUES(${row.date}, ${row.poids})
      `;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Import CSV terminé', count: rows.length }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err) };
  }
};

console.log('Import terminé');
export async function handler(event) {
  try {
    // GET → récupérer toutes les mensurations
    if (event.httpMethod === 'GET') {
      const data = await sql`
        SELECT * FROM measurements
        ORDER BY date DESC
      `;
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    }

    // POST → ajouter
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      const result = await sql`
        INSERT INTO measurements 
        (date, cou, epaules, pectoraux, taille, cuisses, bras, poids)
        VALUES 
        (${body.date}, ${body.cou}, ${body.epaules}, ${body.pectoraux},
         ${body.taille}, ${body.cuisses}, ${body.bras}, ${body.poids})
        RETURNING *
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(result[0]),
      };
    }

    // PUT → modifier
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);

      const result = await sql`
        UPDATE measurements
        SET cou=${body.cou},
            epaules=${body.epaules},
            pectoraux=${body.pectoraux},
            taille=${body.taille},
            cuisses=${body.cuisses},
            bras=${body.bras},
            poids=${body.poids}
        WHERE id=${body.id}
        RETURNING *
      `;

      return {
        statusCode: 200,
        body: JSON.stringify(result[0]),
      };
    }

    // DELETE → supprimer
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);

      await sql`DELETE FROM measurements WHERE id=${id}`;

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Deleted' }),
      };
    }

  } catch (error) {
    console.error("Erreur backend:", error); // <== AJOUT
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
}
}
