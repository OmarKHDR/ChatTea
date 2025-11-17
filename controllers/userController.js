import { stringify } from 'uuid';
import UserManager from '../utils/user.js';

const noNeedAuth = ['/login','/signup', '/login/', '/signup/']

export default class userController {
	static async checkUser(req, res, next){
		console.log('trying to log in')
		const user = req.body ? req.body.username : null;
		const password = req.body ? req.body.password : null;
		console.log(user, password);
		try{
			const status = await UserManager.checkPassword(user, password)
			if(status === true){
				req.session.user = { username: user };
				next();
				return
			}
			return res.status(401).json({ status: 'failed', reason: 'Incorrect credintials, contact db manager for reasignment' });
		} catch (err) {
			console.log('err while checking user', err.message);
		}
	}

	static signup(req, res) {
		if (req.session && req.session.user) {
			return res.status(200).json({status:1, reason:"successful account creation"})
		}
	}

	static async checkUserData(req, res, next) {
		const user = req.body
		if(!(user && user.username && user.password && user.confirmPassword && user.email)) {
			return res.send({status:0, reason: "no sufficient data"})
		} else {
			if (user.confirmPassword === user.password){
				const newuser = await UserManager.addUser(user.username, user.password, user.email)
				if (newuser.status == "failed")
					return res.send({status:0, reason: "error while saving user, username already exists" })
				req.session.user = {username: user.username}
				next();
			} else {
				return res.send({status:0, reason: "passwords doesn't match stop bypassing front-end you idiot"})
			}
		}
	}

	static login(req, res) {
		if (req.session.user) {
			res.redirect('/home')
			return
		} else {
			res.redirect('/login')
			return
		}
	}

	static getUserName (req, res){
		if(req.session && req.session.user) {
			res.send(req.session.user)
		}
	}

	static isAuthenticated(req, res, next) {
		if (req.session && req.session.user) {
			if (noNeedAuth.includes(req.path)) {
				return res.redirect('/home'); // return to avoid calling next
			}
			next();
		} else {
			if (!noNeedAuth.includes(req.path)) {
				req.session.redirectTo = req.originalUrl; // Store the original url so we can redirect after login.
				return res.redirect('/login'); // return to avoid calling next
			}
			next();
		}
	}

}