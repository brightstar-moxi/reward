import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(
  components.rateLimiter,
  {
    loginByIp: {
      kind: "token bucket",
      rate: 20,
      period: 60_000,
      capacity: 20,
    },

    loginByEmail: {
      kind: "token bucket",
      rate: 5,
      period: 60_000,
      capacity: 5,
    },
  }
);