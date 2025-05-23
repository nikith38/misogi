import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { config } from 'dotenv';
import WebSocket from 'ws';

// Load environment variables
config();

// Configure Neon to use WebSocket
const neonConfig = { webSocketConstructor: WebSocket };

const DATABASE_URL = process.env.DATABASE_URL;
console.log('Connecting to database...');
console.log('Database URL domain:', DATABASE_URL.split('@')[1].split('/')[0]);

// Create a connection pool
const pool = new Pool({ connectionString: DATABASE_URL });

// Test the connection
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current database time:', result.rows[0].now);
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
