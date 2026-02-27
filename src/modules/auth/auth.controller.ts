import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";
import {
  storeRefreshToken,
  removeRefreshToken,
  validateRefreshToken,
} from "../../services/redis";

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
