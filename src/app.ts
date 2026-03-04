import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import "./modules/oauth/google.strategy";
import "./modules/oauth/github.strategy";
import googleAuth from "./modules/oauth/google.router";
import githubAuth from "./modules/oauth/github.router";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Autenticação funcionando 🚀");
});

app.use(authRoutes, googleAuth, githubAuth);

export default app;
