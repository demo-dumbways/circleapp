import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize the Ratelimit instance
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, "1m"), // 10 requests per minute
  prefix: "circle-rate-limit", // Prefix for the rate limit keys in Redis
});

export default rateLimit;
