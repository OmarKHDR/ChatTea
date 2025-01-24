import roomManage from '../utils/room.js'
import {writeFileSync} from 'fs'

export default class roomController{
	static async createRoom(req, res) {
		if (req && req.body) {
			const roomName = req.body.roomName;
			const picture = req.body.picture;
			const description = req.body.description;
			let filePath;
			if (picture && picture.startsWith('data:image') && picture.includes(';base64,')){
				const fileType = picture.split(';')[0].split('/')[1];
				const base64Data = picture.replace(/^data:image\/\w+;base64,/, '');
				filePath = `../../roomPics/${roomName}.${fileType}`
				writeFileSync(filePath, base64Data, { encoding: 'base64' });
			} else {
				console.log('no image for the room, using default one')
				filePath = `../../roomPics/default.jpg`
			}
			try {
				roomManage.createRoom(roomName, filePath, description);
				return res.send({status: 'success'})
			} catch(err) {
				console.log(err, "in creating room")
				return res.send({status: 'fail', error: err});
			}
		}
	}

	static async listRooms(req, res) {
		const rooms = await roomManage.listRooms()
		console.log(rooms)
		res.send(rooms)
	}
}