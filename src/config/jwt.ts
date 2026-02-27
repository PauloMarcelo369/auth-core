import "dotenv/config";
import { SignOptions } from "jsonwebtoken";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável ${name} não definida`);
  }
  return value;
}

export const jwtConfig: {
  secret: string;
  signOptions: SignOptions;
} = {
  secret: requiredEnv("JWT_SECRET"),
  signOptions: {
    expiresIn: "15m",
    algorithm: "HS256",
  },
};

export const refreshConfig: {
  secret: string;
  signOptions: SignOptions;
} = {
  secret: requiredEnv("REFRESH_SECRET"),
  signOptions: {
    expiresIn: "7d",
    algorithm: "HS256",
  },
};

export const verifyConfig: {
  secret: string;
  signOptions: SignOptions;
} = {
  secret: requiredEnv("VERIFY_SECRET"),
  signOptions: {
    expiresIn: "7d",
    algorithm: "HS256",
  },
};
