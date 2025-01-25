import { Router } from "express";
import userController from "../controllers/userController.js";
import roomController from "../controllers/roomController.js";
const router = Router();

//user endpoints
router.post('/api/user/submit-login', userController.checkUser, userController.login)
router.post('/api/user/submit-signup', userController.checkUserData, userController.signup)
router.get('/api/user/username', userController.getUserName)


//room endpoints
router.post('/api/room/create-room/', roomController.createRoom)
router.get('/api/room/list-rooms/', roomController.listRooms)
// router.get('/api/room/add-member/', roomController.addMember)
// router.get('/api/room/add-admin/', roomController.addAdmin)
// router.get('/getImage', userController.getImage);

router.get('/login', userController.isAuthenticated,(req, res)=> { res.sendFile('login.html', {'root': '../frontend'}); });
router.get('/signup', userController.isAuthenticated,(req, res)=> { res.sendFile('signup.html', {'root': '../frontend'}); });
router.get('/home', userController.isAuthenticated, (req, res) => { res.sendFile('index.html', {'root': '../frontend'}); });
router.get('/', userController.isAuthenticated, (req, res) => { console.log("hello");res.sendFile('index.html', {'root': '../frontend'}); });

export default router;