import { Router } from "express";
import {
	addQuestion,
	deleteQuestion,
	editQuestion,
	getQuestion,
	getQuestions,
	importCodolioQuestions,
	reorderQuestion,
	undoDelete
} from "../controllers/question.controller.js";

const router = Router()

router.route("/import").post(importCodolioQuestions);
router.get("/", getQuestions);
router.post("/add-question", addQuestion);
router.patch("/reorder", reorderQuestion);
router.get("/:id", getQuestion);
router.put("/:id", editQuestion);
router.delete("/:id", deleteQuestion);
router.get("/undo/:id",undoDelete)

export default router