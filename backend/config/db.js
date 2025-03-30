import dotenv from "dotenv";
dotenv.config({});
import pkg from "pg";
const { Pool } = pkg;

const port = process.env.PG_PORT;
const password = process.env.PG_PASSWORD;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "futurous",
  password: password,
  port: port,
});

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
