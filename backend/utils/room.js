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
			if (this.roomsCollection) {
				return;
			}
			this.client = new MongoClient(this.dbUrl);
			await this.client.connect();
			this.db = await this.client.db(this.dbName);
			// search for room collection
			const collections = await this.db.listCollections().toArray();
			const exists = collections.some(collection => collection.name === 'Users');
			if(!exists) {
				await this.db.createCollection('Rooms');
			}
			this.roomsCollection = this.db.collection('Rooms');
		} catch(err) {
			console.log('error in room collection connection', err)
			throw err
		}
	}

	async createRoom(roomName, picture= '../../roomPics/default.jpg', roomDescription="no description", members=[], admins=[]){
		if (!roomName) return false;
		if (!this.roomsCollection) {
			await this.connect();
			if (!this.roomsCollection) {
				console.error('Failed to initialize room collection');
				return false;
			}
		}
		const roomExists = await this.roomsCollection.findOne({roomName})
		if (roomExists) {
			console.log(`room ${roomName} already exist join it instead`)
			console.error(`room ${roomName} already exist join it instead`)
			return false;
		}
		const room = await this.roomsCollection.insertOne({
			roomName,
			picture,
			description: roomDescription,
			members,
			admins,
		})
		if(room && room.insertedId) {
			return true;
		}
		console.error('the room isnt created try again later')
		return false;
	}

	async addMember(username, roomName){
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const filter = { roomName };
			const update = { $addToSet: { members: username } };
			const updateResult = await this.roomsCollection.updateOne(filter, update);
			
			if (updateResult.modifiedCount > 0) {
				console.log('Successfully added user to members')
			} else if (updateResult.matchedCount > 0) {
				console.log('User already in a member or other changes not made')
			} else {
				console.log('Failed to add member. Room not found.');
				throw new Error('Failed to add member. Room not found.')
			}
		} catch (err) {
			console.log('Error adding member', err);
			throw err;
		}
	}

	async removeMember(username, roomName){
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const filter = { roomName };
			const update = { $pull: { members: username } };
			const updateResult = await this.roomsCollection.updateOne(filter, update);
			
			if (updateResult.modifiedCount > 0) {
				console.log('Successfully removed user to members')
				return {status: 'success'}
			} else if (updateResult.matchedCount > 0) {
				console.log('User doesnt exist in room members')
			} else {
				console.log('Failed to remove member. Room not found.');
				throw new Error('Failed to remove member. Room not found.')
			}
		} catch (err) {
			console.log('Error removing rooms:', err);
			throw err;
		}
	}

	async addAdmin(username, roomName) {
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const filter = { roomName };
			const update = { $addToSet: { admins: username } };
			const updateResult = await this.roomsCollection.updateOne(filter, update);
			
			if (updateResult.modifiedCount > 0) {
				console.log('Successfully added user to admin')
			} else if (updateResult.matchedCount > 0) {
				console.log('User already in admin or other changes not made')
			} else {
				console.log('Failed to add admin. Room not found.');
				throw new Error('Failed to add admin. Room not found.')
			}
		} catch (err) {
			console.log('Error adding admin:', err);
			throw err;
		}
	}

	async removeAdmin(username, roomName){
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const filter = { roomName };
			const update = { $pull: { admins: username } };
			const updateResult = await this.roomsCollection.updateOne(filter, update);
			
			if (updateResult.modifiedCount > 0) {
				console.log(updateResult)
				console.log('Successfully removed user from admins')
				return {status: 'success'}
			} else if (updateResult.matchedCount > 0) {
				console.log(updateResult)
				console.log('User doesnt exist in room admins')
			} else {
				console.log('Failed to remove admin. Room not found.');
				throw new Error('Failed to remove admin. Room not found.')
			}
		} catch (err) {
			console.log('Error removing admin:', err);
			throw err;
		}
	}

	async listAdmins(roomName) {
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const room = await this.roomsCollection.findOne({roomName});
			return room.admins;
		} catch (err) {
			console.log('Error listing admins:', err);
			throw err;
		}
	}

	async listMembers(roomName) {
		try {
			if (!this.roomsCollection) {
				await this.connect();
				if (!this.roomsCollection) {
					throw new Error('Failed to initialize room collection');
				}
			}
			const room = await this.roomsCollection.findOne({roomName});
			return room.members;
		} catch (err) {
			console.log('Error listing admins:', err);
			throw err;
		}
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

import env from 'process'

const roomManage = new roomManager(env.MONGO_URI || 'mongodb://127.0.0.1:27017')
roomManage.connect()
export default roomManage;