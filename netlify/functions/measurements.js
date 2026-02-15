import fs from "fs";
import { neon } from "@netlify/neon";

const sql = neon();

export async function handler(event) {
  try {
    // GET → récupérer toutes les mensurations
    if (event.httpMethod === "GET") {
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
    if (event.httpMethod === "POST") {

        const b = JSON.parse(event.body);
        const result = await sql`
    INSERT INTO measurements (date, poids, cou, epaules, pectoraux, taille, cuisses, bras)
    VALUES (${b.date}, ${b.poids}, ${b.cou}, ${b.epaules}, ${b.pectoraux}, ${b.taille}, ${b.cuisses}, ${b.bras})
    ON CONFLICT (date) 
    DO UPDATE SET 
        poids = EXCLUDED.poids,
        cou = EXCLUDED.cou,
        epaules = EXCLUDED.epaules,
        pectoraux = EXCLUDED.pectoraux,
        taille = EXCLUDED.taille,
        cuisses = EXCLUDED.cuisses,
        bras = EXCLUDED.bras
    RETURNING *
  `;
        return { statusCode: 201, body: JSON.stringify(result[0]) };

    }

    // PUT → modifier
    if (event.httpMethod === "PUT") {
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
    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);

      await sql`DELETE FROM measurements WHERE id=${id}`;

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Deleted" }),
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
