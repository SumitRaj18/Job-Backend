import Redis from 'ioredis';

const redis = new Redis("redis://:bw5GwOUv6c0KikdlRnvZG9LRV1yZvHRA@redis-10727.c73.us-east-1-2.ec2.cloud.redislabs.com:10727");

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis Cloud!");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

export default redis;