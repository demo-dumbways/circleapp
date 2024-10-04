import { NextFunction, Request, Response } from "express";
import { ThreadType, ThreadWithDetailType } from "../types/types";
import { redisClient } from "../libs/redis";

import ResponseDTO from "../dtos/ResponseDTO";

class Redis {
  async getThreads(req: Request, res: Response, next: NextFunction) {
    const threads = await redisClient.get("VIBES");

    if (threads) {
      return res.status(200).json(
        new ResponseDTO<ThreadWithDetailType[]>({
          error: false,
          message: {
            status: "Threads retrieved!",
          },
          data: threads,
        })
      );
    }

    next();
  }

  async setThreads(threads: ThreadType[]) {
    await redisClient.set("VIBES", threads);
  }

  async deleteThreads() {
    await redisClient.del("VIBES");
  }
}

export default new Redis();
