import userManage from '../utils/user.js';

const noNeedAuth = ['/login','/signup', '/login/', '/signup/']

export default class userController {
	static async checkUser(req, res, next){
		console.log('trying to log in')
		const user = req.body ? req.body.username : null;
		const password = req.body ? req.body.password : null;
		console.log(user, password);
		try{
			const status = await userManage.checkPassword(user, password)
			if(status === true){
				req.session.user = { username: user };
				next();
				return
			}
			return res.redirect('/login')
		} catch (err) {
			console.log(err);
		}
	}

	static signup(req, res) {
		if (req.session && req.session.user) {
			return res.redirect('/home')
		}
	}

	static async checkUserData(req, res, next) {
		const user = req.body
		if(!(user && user.username && user.password && user.confirmPassword && user.email)) {
			res.send({error: "no sufficient data"})
		} else {
			if (user.confirmPassword === user.password){
				try{
					await userManage.addUser(user.username, user.password, user.email)
				} catch(err) {
					console.log(err)
					res.send({error: err})
					return
				}
				req.session.user = {username: user.username}
				next();
			} else {
				return res.send({error: "passwords doesn't match stop bypassing front-end you idiot"})
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