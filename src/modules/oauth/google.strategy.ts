import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/User";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const repo = AppDataSource.getRepository(User);
      let user = await repo.findOne({
        where: { provider: "google", providerId: profile.id },
      });
      if (!user) {
        user = repo.create({
          email: profile.emails?.[0].value,
          provider: "google",
          password: "",
          providerId: profile.id,
          isVerified: true,
        });
        await repo.save(user);
      }
      return done(null, user);
    },
  ),
);
