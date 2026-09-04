import { Router } from "express";
import { addTopic, deleteTopic, editTopic, getTopic, getTopics, reorderTopic, } from "../controllers/topic.controller.js";
const router = Router();
router.get("/", getTopics);
router.post("/add-topic", addTopic);
router.patch("/reorder", reorderTopic);
router.get("/:id", getTopic);
router.put("/:id", editTopic);
router.delete("/:id", deleteTopic);
export default router;
//# sourceMappingURL=topic.route.js.map