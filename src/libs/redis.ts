/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";
import CircleError from "../utils/CircleError";
import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from "../configs/config";

export let redisClient: any;

export async function initRedis() {
  try {
    redisClient = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    throw new CircleError({ error: `Redis client error: ${err}` });
  }
}
