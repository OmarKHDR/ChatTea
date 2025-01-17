import userManage from '../utils/user.js';

export default class userController {
	static async checkUser(req, res, next){
		console.log('trying to log in')
		const user = req.body ? req.body.username : null;
		const password = req.body ? req.body.password : null;
		console.log(user, password);
		try{
			const status = await userManage.checkPassword(user, password)
			console.log(status)
			if(status === false){
				req.session.user = { username: user };
				next();
			}
		} catch (err) {
			console.log(err);
		}
	}

	static login(req, res) {
		if (req.session.user) {
			res.redirect('/home')
		}
	}

	static isAuthenticated(req, res, next) {
		if (req.session && req.session.user) {
			next();
		} else {
			res.redirect('/login');
		}
	}
}