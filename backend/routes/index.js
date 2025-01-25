import { Router } from "express";
import userController from "../controllers/userController.js";
import roomController from "../controllers/roomController.js";
import messageController from "../controllers/messageController.js";
const router = Router();

//user endpoints
router.post('/api/user/submit-login', userController.checkUser, userController.login)
router.post('/api/user/submit-signup', userController.checkUserData, userController.signup)
router.get('/api/user/username', userController.getUserName)


//room endpoints
router.post('/api/room/create-room/', roomController.createRoom)
router.get('/api/room/list-rooms/', roomController.listRooms)
router.get('/api/room/room-session/', roomController.setRoom)
// router.get('/api/room/add-member/', roomController.addMember)
// router.get('/api/room/add-admin/', roomController.addAdmin)
// router.get('/getImage', userController.getImage);

//message related endpoints
router.get('/api/message/all-messages/', messageController.isAuthenticated, messageController.getAllMessages)
router.post('/api/message/add-message/', messageController.isAuthenticated, messageController.addMessage)


router.get('/login', userController.isAuthenticated,(req, res)=> { res.sendFile('login.html', {'root': '../frontend'}); });
router.get('/signup', userController.isAuthenticated,(req, res)=> { res.sendFile('signup.html', {'root': '../frontend'}); });
router.get('/home', userController.isAuthenticated, (req, res) => { res.sendFile('index.html', {'root': '../frontend'}); });
router.get('/', userController.isAuthenticated, (req, res) => { console.log("hello");res.sendFile('index.html', {'root': '../frontend'}); });

export default router;