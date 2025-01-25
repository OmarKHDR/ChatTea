import { MongoClient } from 'mongodb';

class roomManager {
	constructor(dbUrl='mongodb://127.0.0.1:27017', dbName='chaiApp'){
		this.dbUrl = dbUrl;
		this.dbName = dbName;
		this.client = null;
		this.db = null;
		this.roomsCollection = null;
	}

	async connect(){
		try {
			this.client = new MongoClient(this.dbUrl);
			await this.client.connect();
			this.db = await this.client.db(this.dbName);
			// search for room collection
			const collections = await this.db.listCollections().toArray();
			if(!collections.includes('Rooms')) {
				await this.db.createCollection('Rooms');
			}
			this.roomsCollection = this.db.collection('Rooms');
		} catch(err) {
			console.log('error in room collection connection', err)
			throw err
		}
	}

	async createRoom(roomName, picture= '../../roomPics/default.jpg', roomDescription="no description", members=[], admins=[]){
		try{
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const roomExists = await this.roomsCollection.findOne({roomName})
			if (roomExists) {
				throw new Error('room already exists, join it instead')
			}
			const room = await this.roomsCollection.insertOne({
				roomName,
				picture,
				description: roomDescription,
				members,
				admins,
			})
			if(room && room.insertedId) {
				return {message: 'room created successfully', id: room.insertedId};
			}
			throw new Error('the room isnt created try again later')
		} catch(err) {
			console.log(err, 'couldnt create the room')
			throw err
		}
	}

	async addMember(username, room, isAdmin){

	}

	async listRooms(){
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const rooms = await this.roomsCollection.find({}, {projection: {roomName: 1, _id: 0}}).toArray();
			return rooms;
		} catch (err) {
			console.log('Error listing rooms:', err);
			throw err;
		}
	}

}

const roomManage = new roomManager()
roomManage.connect()
export default roomManage;