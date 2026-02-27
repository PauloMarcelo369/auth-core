import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Autenticação funcionando 🚀");
});

app.use("/auth", authRoutes);

export default app;
