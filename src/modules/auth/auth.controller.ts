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
  storeResetToken,
  getUserIdByResetToken,
  removeResetToken,
} from "../../services/redis";

import { publishEmail, connectRabbitMQ } from "../../services/rabbitmq-setup";

import { User } from "../../entities/User";
import bcrypt from "bcrypt";
import { AppDataSource } from "../../config/data-source";
import { v4 as uuidv4 } from "uuid";

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email } });
  if (existing) return res.status(400).json({ message: "Email já registrado" });

  const hashed = await bcrypt.hash(password, 10);
  const user = repo.create({ email, password: hashed });
  await repo.save(user);

  const verifyToken = generateVerifyToken({ id: user.id });

  await connectRabbitMQ();

  publishEmail({
    to: email,
    subject: "Confirme seu cadastro",
    body: `Clique no link para validar: http://localhost:3000/auth/verify/${verifyToken}`,
  });

  res.json({ message: "Usuário registrado. Verifique seu email." });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json("você precisa passar o email para realizar essa ação!");
  }

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado");

  const resetToken = uuidv4();
  await storeResetToken(user.id, resetToken);
  await connectRabbitMQ();

  publishEmail({
    to: email,
    subject: "Recuperação de senha",
    body: `Use o token para redefinir a senha: ${resetToken}`,
  });

  res.json({
    message: "Pedido de redefinição enviado. Verifique o seu email.",
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json("Os argumentos não podem ser vazios");
  }

  const userId = await getUserIdByResetToken(token);

  if (!userId) {
    return res.status(404).json("Token inválido ou expirado");
  }

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado");
  user.password = await bcrypt.hash(newPassword, 10);
  await repo.save(user);
  await removeResetToken(token);
  res.json({ message: "Senha redefinida com Sucesso!" });
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.params.token;

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
      return res.json({ message: "Email verificado com sucesso!" });
    }
  }

  return res.status(400).json({ message: "Token inválido ou expirado" });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { email } });

  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Email ou senha inválidos" });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "Email ainda não foi verificado." });
  }

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await storeRefreshToken(user.id, refreshToken);

  return res.json({ accessToken, refreshToken });
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
