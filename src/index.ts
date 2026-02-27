import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
dotenv.config();

import { AppDataSource } from "./config/data-source";

AppDataSource.initialize()
  .then(() => {
    console.log("Banco conectado");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  })
  .catch((err) => console.error("Erro ao conectar DB:", err));
