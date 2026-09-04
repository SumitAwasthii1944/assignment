import { Redis } from 'ioredis';
declare const redis: Redis<"legacy">;
export default redis;
export declare const disconnectRedis: () => Promise<void>;
//# sourceMappingURL=redis.d.ts.map