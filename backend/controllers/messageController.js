import messageManage from "../utils/messages";

export default class messageController {
	static async addMessage(req, res) {
		
	}

	static async isAuthenticated(req, res, next) {
		if (req.session && req.session.user) {
			const userName = req.session.user.username;
			const roomName = req.session.room.roomName;
			if (req.body && req.body.messageId) {
				
			}
		}
	}
}
