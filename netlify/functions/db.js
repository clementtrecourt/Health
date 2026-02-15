import { neon } from '@netlify/neon';

const sql = neon(); // utilise automatiquement NETLIFY_DATABASE_URL

export async function handler(event) {
  try {
    const result = await sql`SELECT NOW()`;
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
