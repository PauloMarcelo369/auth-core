import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";

export async function userAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const repo = AppDataSource.getRepository(User);

    if (!payload.id) {
      return res.status(403).json({ message: "invalid token" });
    }
    const user = await repo.findOne({ where: { id: payload.id } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
