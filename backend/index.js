import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import authRouter from "./controllers/authController.js";
import msgRouter from "./controllers/msgController.js";
import { middleware } from "./middleware/authMiddleware.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/api/auth", authRouter);
app.use("/api/messages", middleware, msgRouter);


app.get("/", (req, res) => {
  res.send("Hello PostGres");
});

app.get("/api/protected", middleware, (req, res) => {
  res.json({
    msg: "Protected route",
    user: req.user,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Website is running on http://localhost:${PORT}`);
});
