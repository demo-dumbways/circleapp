/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";
import CircleError from "../utils/CircleError";
import { REDIS_TOKEN, REDIS_URL } from "../configs/config";

export let redisClient: any;

export async function initRedis() {
  try {
    redisClient = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    });
  } catch (err) {
    throw new CircleError({ error: `Redis client error: ${err}` });
  }
}
