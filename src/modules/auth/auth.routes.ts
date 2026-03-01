import { Router } from "express";
import {
  login,
  refresh,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "./auth.controller";

import { userAuthorization } from "../../middlewares/authorization";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", userAuthorization, logout);
router.post("/auth/register", register);
router.get("/auth/verify/:token", verifyEmail);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
