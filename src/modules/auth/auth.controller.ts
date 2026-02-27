import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerifyToken,
  verifyRefreshToken,
  verifyToken,
} from "../../utils/token";
import {
  storeRefreshToken,
  removeRefreshToken,
  validateRefreshToken,
} from "../../services/redis";

import { publishEmail } from "../../services/rabbitmq-setup";

import { User } from "../../entities/User";
import bcrypt from "bcrypt";
import { AppDataSource } from "../../config/data-source";
import { JwtPayload } from "jsonwebtoken";

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email } });
  if (existing) return res.status(400).json({ message: "Email já registrado" });

  const hashed = await bcrypt.hash(password, 10);
  const user = repo.create({ email, password: hashed });
  await repo.save(user);

  const verifyToken = generateVerifyToken({ id: user.id });
  publishEmail({
    to: email,
    subject: "Confirme seu cadastro",
    body: `Clique no link para validar: http://localhost:3000/verify/${verifyToken}`,
  });

  res.json({ message: "Usuário registrado. Verifique seu email." });
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.params.token;

  try {
    if (typeof token === "string") {
      const payload = verifyToken(token);

      if (typeof payload === "object" && "id" in payload) {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({ where: { id: payload.id } });
        if (!user)
          return res.status(404).json({ message: "Usuário não encontrado" });

        if (user.isVerified) {
          return res.status(400).json({ message: "Email já verificado." });
        }
        user.isVerified = true;
        await repo.save(user);
        res.json({ message: "Email verificado com sucesso!" });
      }
    }
  } catch {
    res.status(400).json({ message: "Token inválido ou expirado" });
  }
}

export async function login(req: Request, res: Response) {
  const { user } = req.body;
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await storeRefreshToken(user.id, refreshToken);

  res.json({ accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  try {
    const payload: any = verifyRefreshToken(refreshToken);

    const isValid = await validateRefreshToken(payload.id, refreshToken);

    if (!isValid)
      return res.status(401).json({ message: "Refresh token inválido" });

    await removeRefreshToken(payload.id);

    const newAccessToken = generateAccessToken({ id: payload.id });
    const newRefreshToken = generateRefreshToken({ id: payload.id });

    await storeRefreshToken(payload.id, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

export async function logout(req: Request, res: Response) {
  const { userId } = req.body;
  await removeRefreshToken(userId);
  res.json({ message: "Logout realizado com sucesso" });
}
