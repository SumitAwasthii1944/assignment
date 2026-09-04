import { Router } from "express";
import { addQuestion, deleteQuestion, editQuestion, getQuestion, importCodolioQuestions, reorderQuestion, } from "../controllers/question.controller.js";
const router = Router();
router.route("/import").post(importCodolioQuestions);
router.post("/add-question", addQuestion);
router.patch("/reorder", reorderQuestion);
router.get("/:id", getQuestion);
router.put("/:id", editQuestion);
router.delete("/:id", deleteQuestion);
export default router;
//# sourceMappingURL=questionImport.route.js.map