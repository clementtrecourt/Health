import { neon } from '@netlify/neon';

const sql = neon();

export async function handler(event) {
  try {
    const posts = await sql`SELECT * FROM posts`;

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
