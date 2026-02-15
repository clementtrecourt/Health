// scripts/importData.js
import { neon } from '@netlify/neon';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Pour lire le .env en local

const sql = neon(process.env.NETLIFY_DATABASE_URL);

async function importCSV() {
  try {
    const csvPath = path.resolve('./weights.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    const rows = csvData
      .split('\n')
      .slice(1) // ignorer l'entête
      .filter(line => line.trim() !== '') // ignorer lignes vides
      .map(line => {
        const [date, poids] = line.split(',');
        return { date, poids: parseFloat(poids) };
      });

    console.log(`Début de l'import de ${rows.length} lignes...`);

    for (const row of rows) {
      await sql`
        INSERT INTO measurements(date, poids)
        VALUES(${row.date}, ${row.poids})
        ON CONFLICT (date) DO UPDATE SET poids = EXCLUDED.poids
      `;
    }

    console.log('Import terminé avec succès !');
  } catch (err) {
    console.error('Erreur lors de l’import:', err);
  }
}

importCSV();