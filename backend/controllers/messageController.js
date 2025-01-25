import messageManage from "../utils/messages.js";

export default class messageController {
	static async addMessage(req, res) {
		try{
			const room = req.session.room.roomName;
			const user = req.session.user.username;
			if (req.body && req.body.message) {
				const message = req.body.message;
				const time = req.body.timeCreated;
				// console.log("checking message add req", req.body, room, user, message, time, "ended")
				const state = await messageManage.addMessage(room, user, message, time)
				return res.send(state);
			} else {
				return res.send({status:"failed"})
			}
		} catch (err) {
			console.log('error creating new message in db', err)
			return res.status(500).json({status: "failed"})
		}
	}

	static async getAllMessages(req, res) {
		try{
			const room = req.session.room.roomName;
			const user = req.session.user.username;
			const result = await messageManage.getRoomMessages(room);
			if(result){
				return res.status(200).json(result)
			} else {
				return res.status(400).json({status:"failed"})
			}
		} catch (err) {
			console.log('error sending messages from db', err)
			return res.status(500).json({status: "failed"})
		}
	}
	static async isAuthenticated(req, res, next) {
		if (req.session && req.session.user && req.session.room) {
			console.log('authenticated to access messages', req.session)
			next();
		}
		else {
			console.log("not authenticated user", req.session.room);
			res.status(401).json({status:"failed"});
		}
	}

	static async ownershipCheck(req, res, next) {
		if (req.session && req.session.user) {
			try{
				const userName = req.session.user.username;
				const roomName = req.session.room.roomName;
				if (req.body && req.body.messageId) {
					const messageObj = await messageManage.getMessageById(req.body.messageId);
					if (!messageObj) {
						console.log('message wasnt found');
						return res.status(401).json({status: 'fail', reason: 'message not found in db'})
					}
					if (messageObj.userName === userName && messageObj.roomName === roomName) {
						console.log("has the permission to edit message");
						next();
					} else {
						console.log('not the owner');
						return res.status(401).json({status: 'failed', reason: 'not the owner of the message'})
					}
				}
			} catch(err) {
				console.log(err,'due to the message owner ship check')
				return res.status(500).json({status:"failed", reason: "no idea ask someone~"})
			}
		} else {
			return res.status(401).json({status: "failed"})
		}
	}
}
