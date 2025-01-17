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


	static getUserName (req, res){
		if(req.session && req.session.user) {
			res.send(req.session.user)
		}
	}

	static isAuthenticated(req, res, next) {
		if (req.session && req.session.user) {
			if (req.path === '/login') {
				 return res.redirect('/home'); // return to avoid calling next
			}
			next();
		} else {
			if (req.path !== '/login') {
				 req.session.redirectTo = req.originalUrl; // Store the original url so we can redirect after login.
				return res.redirect('/login'); // return to avoid calling next
			}
			next();
		}
	}

	static async setNameBySocId(id, username) {
		try {
			const _id = await userManage.getUserId(username);
			await userManage.addDataToUser(_id, 'socId', id);
		} catch (err) {
			console.log(err);
		}
	}

	static async getNameBySocId(id) {
		try {
			const name = await userManage.getUserName('socId', id);
			return name;
		} catch (err) {
			console.log(err)
		}
	}
}