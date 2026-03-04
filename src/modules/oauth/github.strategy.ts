import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/User";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      const repo = AppDataSource.getRepository(User);
      let user = await repo.findOne({
        where: { provider: "github", providerId: profile.id },
      });
      profile;
      if (!user) {
        user = repo.create({
          email: profile.emails?.[0].value,
          provider: "github",
          password: undefined,
          providerId: profile.id,
          isVerified: true,
        });
        await repo.save(user);
      }
      return done(null, user);
    },
  ),
);
