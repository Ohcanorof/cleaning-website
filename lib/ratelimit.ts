import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const reservationRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), //5 requests per 10 minutes allowed
  analytics: true, //optional (may remove, may not)
  prefix: "ratelimit",
});