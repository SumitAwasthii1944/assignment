import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// routes import
import questionImportFromCodolio from "./routes/questionImport.route.js";
import topicRoutes from "./routes/topic.route.js";
import subTopicRoutes from "./routes/subtopic.route.js";
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// routes declaration
app.use("/api/v1/questions", questionImportFromCodolio);
app.use("/api/v1/topic", topicRoutes);
app.use("/api/v1/subTopic", subTopicRoutes);
app.use("/api/v1/question", questionImportFromCodolio);
export { app };
//# sourceMappingURL=app.js.map