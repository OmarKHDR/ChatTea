import roomManage from '../utils/room.js'
import {writeFileSync} from 'fs'

export default class roomController{

	static async removeSession(req, res) {
		if(req.session) {
			req.session.destroy();
			res.status(200).json({status:1, reason:"successfully deleted session"});
		} else {
			res.status(401).json({status:0, reason:"not authorized to delete session"});
		}
	}
	static async createRoom(req, res) {
		if (req && req.body) {
			const roomName = req.body.roomName;
			const picture = req.body.picture;
			const description = req.body.description;
			const username = req.body.admin
			console.log(roomName, description)
			let filePath;
			if (false && picture && picture.startsWith('data:image') && picture.includes(';base64,')){
				const fileType = picture.split(';')[0].split('/')[1];
				const base64Data = picture.replace(/^data:image\/\w+;base64,/, '');
				filePath = `../../roomPics/${roomName}.${fileType}`
				writeFileSync(filePath, base64Data, { encoding: 'base64' });
			} else {
				console.log('no image for the room, using default one')
				filePath = `../../roomPics/default.jpg`
			}
			const isCreated = await roomManage.createRoom(roomName, filePath, description,undefined, [username]);
			if (isCreated) return res.send({status: 'success'})
			else {
				console.error(err, "in creating room")
				return res.send({status: 'fail', error: err});
			}
		}
	}

	static async listRooms(req, res) {
		const rooms = await roomManage.listRooms()
		console.log(rooms)
		res.send(rooms)
	}

	static async listAdmins(req, res) {
		if(req.session.room && req.session.room.roomName ) {
			const admins = await roomManage.listAdmins(req.session.room.roomName)
			console.log(admins)
			res.status(200).json(admins)
		}
	}

	static async listMembers(req, res) {
		if(req.session.room && req.session.room.roomName ) {
			const members = await roomManage.listMembers(req.session.room.roomName)
			console.log(members)
			res.send(members)
		}
	}

	static async addAdmin(req,res) {
		if (req.body && req.body.username && req.body.roomName){
			try{
				roomManage.addAdmin(req.body.username, req.body.roomName);
				res.status(200).json({status:"success"});
			} catch (err) {
				console.log("error adding admin", err);
				res.status(500).json({status:"failed"})
			}
		}
	}

	static async removeAdmin(req,res) {
		if (req.body && req.body.username && req.body.roomName){
			try{
				roomManage.removeAdmin(req.body.username, req.body.roomName);
				res.status(200).json({status:"success"});
			} catch (err) {
				console.log("error adding admin", err);
				res.status(500).json({status:"failed"})
			}
		}
	}

	static async addMember(req,res) {
		if (req.body && req.session.user && req.session.room){
			try{
				roomManage.addMember(req.session.user.username, req.session.room.roomName);
				res.status(200).json({status:"success"});
			} catch (err) {
				console.log("error adding member", err);
				res.status(500).json({status:"failed"})
			}
		}
	}

	static async removeMember(req,res) {
		if (req.body && req.session.user && req.query.roomName){
			try{
				roomManage.removeMember(req.session.user.username, req.session.room.roomName);
				res.status(200).json({status:"success"});
			} catch (err) {
				console.log("error removing member", err);
				res.status(500).json({status:"failed"})
			}
		}
	}

	static setRoom(req, res) {
		console.log('session room ->', req.query.roomName)
		if(req.session && req.session.user && req.query.roomName){
			req.session.room = {roomName: req.query.roomName}
			return res.send({status:"success"})
		} else {
			console.log('no sufficient data')
			return res.status(400).json({status:"failed"})
		}
	}
}