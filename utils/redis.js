import Redis from 'ioredis';

const redis = new Redis("redis://default:Sumit@redis-18460.c52.us-east-1-4.ec2.cloud.redislabs.com:18460");

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis Cloud!");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

export default redis;