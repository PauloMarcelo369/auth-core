import { Router } from "express";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { storeRefreshToken } from "../../services/redis";
const router = Router();

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  async (req: any, res) => {
    const user = req.user;
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });
    await storeRefreshToken(user.id, refreshToken);
    res.json({ accessToken, refreshToken });
  },
);
export default router;
