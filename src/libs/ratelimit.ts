import { Ratelimit } from "@upstash/ratelimit";
import { redisClient } from "./redis";

// Initialize the Ratelimit instance
const rateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, "1m"), // 10 requests per minute
  prefix: "circle-rate-limit", // Prefix for the rate limit keys in Redis
});

export default rateLimit;
