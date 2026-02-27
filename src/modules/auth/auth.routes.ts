import { Router } from "express";
import {
  login,
  refresh,
  logout,
  register,
  verifyEmail,
} from "./auth.controller";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);
router.post("/auth/register", register);
router.get("/auth/verify/:token", verifyEmail);

export default router;
