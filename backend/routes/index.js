import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

router.post('/submit-login', userController.checkUser)

export default router;