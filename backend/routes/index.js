import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

router.post('/submit-login', userController.checkUser, userController.login)

router.get('/login', userController.isAuthenticated, (req, res)=> { res.sendFile('login.html', {'root': '../frontend'}); });
router.get('/home', userController.isAuthenticated, (req, res) => { res.sendFile('index.html', {'root': '../frontend'}); });


export default router;