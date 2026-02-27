import jwt from "jsonwebtoken";
import { jwtConfig, refreshConfig } from "../config/jwt";

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, jwtConfig.secret, jwtConfig.signOptions);
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, refreshConfig.secret, refreshConfig.signOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, jwtConfig.secret);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshConfig.secret);
}
