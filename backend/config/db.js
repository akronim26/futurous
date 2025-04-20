import dotenv from "dotenv";
dotenv.config({});
import pkg from "pg";
const { Pool } = pkg;

const port = process.env.PG_PORT;
const password = process.env.PG_PASSWORD;

let pool;

if (process.env.DATABASE_URL) {
  // Docker/Production configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
} else {
  // Local development configuration
  pool = new Pool({
    user: "postgres",
    host: process.env.DB_HOST || "localhost",
    database: "futurous",
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
  });
}

pool
  .connect()
  .then(() =>
    console.log(
      `Connected successfully to database futurous at port number: ${port}`
    )
  )
  .catch((err) => {
    console.log(err);
    console.log("Connection failed");
  });

export { pool };
