import rateLimit from "../libs/ratelimit";

export const rateLimiterMiddleware = async (req, res, next) => {
  const identifier = req.ip; // Use IP address as the identifier

  const { success, remaining, reset } = await rateLimit.limit(identifier);

  res.set("X-RateLimit-Limit", "10");
  res.set("X-RateLimit-Remaining", remaining.toString());
  res.set("X-RateLimit-Reset", reset.toString());

  if (!success) {
    res.status(429).send("Too many requests - try again later");
    return;
  }

  next();
};
