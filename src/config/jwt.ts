export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "15m",
};

export const refreshConfig = {
  secret: process.env.REFRESH_SECRET,
  expiresIn: "7d",
};
