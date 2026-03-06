import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "leandroatochkin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "postgres",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Optional: test connection on startup
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed", error);
    process.exit(1);
  }
};

export const db = pool;