import Redis from 'ioredis';

const redis = new Redis("redis://default:Sumit@redis-13767.c256.us-east-1-2.ec2.cloud.redislabs.com:13767");

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis Cloud!");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

export default redis;