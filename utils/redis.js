import Redis from 'ioredis';

<<<<<<< HEAD
const redis = new Redis("redis://default:Sumit@redis-18460.c52.us-east-1-4.ec2.cloud.redislabs.com:18460");
=======
const redis = new Redis("redis://default:Sumit@redis-13767.c256.us-east-1-2.ec2.cloud.redislabs.com:13767");
>>>>>>> 800445ffa9afb4283275928928ebdd015a61c978

redis.on("connect", () => {
    console.log("✅ Successfully connected to Redis Cloud!");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

export default redis;