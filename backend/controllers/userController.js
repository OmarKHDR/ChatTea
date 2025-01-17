import userManage from '../utils/user.js';

export default class userController {
	static checkUser(req, res){
		console.log('trying to log in')
		const user = req.body ? req.body.username : null;
		const password = req.body ? req.body.password : null;
		console.log(user, password);
		try{
			userManage.checkPassword(user, password)
		} catch (err) {
			console.log(err);
		}
	}
}