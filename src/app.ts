import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import "./modules/oauth/google.strategy";
import googleAuth from "./modules/oauth/google.router";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Autenticação funcionando 🚀");
});

app.use(authRoutes, googleAuth);

export default app;
