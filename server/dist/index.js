import { app } from "./app.js";
import connectDB from "./db/dbConnect.js";
import redis from "./db/redis.js";
connectDB()
    .then(() => {
    return redis.ping();
})
    .then(() => {
    console.log("Redis connected !!");
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
    .catch((error) => {
    console.error("Error connecting to MongoDB or Redis:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map