import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./config/data-source";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Autenticação funcionando 🚀");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Banco conectado");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  })
  .catch((err) => console.error("Erro ao conectar DB:", err));
