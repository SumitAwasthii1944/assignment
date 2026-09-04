import { Router } from "express";
import { addSubTopic, deleteSubTopic, editSubTopic, getSubTopic, getSubTopics, reorderSubTopic, } from "../controllers/subtopic.controller.js";
const router = Router();
router.get("/", getSubTopics);
router.post("/:topic/add-sub-topic", addSubTopic);
router.patch("/reorder", reorderSubTopic);
router.get("/:id", getSubTopic);
router.put("/:id", editSubTopic);
router.delete("/:id", deleteSubTopic);
export default router;
//# sourceMappingURL=subtopic.route.js.map