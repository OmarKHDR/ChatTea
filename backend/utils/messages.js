import { MongoClient,  ObjectId} from "mongodb";

class messageManager{
	constructor(dburl="mongodb://127.0.0.1:27017", dbName="chaiApp") {
		this.dbUrl = dburl;
		this.dbName = dbName;
		this.client = null;
		this.db = null;
		this.messagesCollection = null;
	}

	async connect(){
		try {
			this.client = await new MongoClient(this.dbUrl);
			this.db = await this.client.db(this.dbName);
			const collections = await this.db.listCollections().toArray();
			const exists = collections.some(collection => collection.name === 'Users');
			if(!exists) {
				await this.db.createCollection('Messages')
			}
			this.messagesCollection = await this.db.collection('Messages')
		} catch (err){
			console.log("error connecting to messages collection", err)
			return {status: "failed to connect to messages collection"}
		}
	}

	async addMessage(roomName, userName, message, timeCreated){
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to connect to messages db');
				}
			}
			if(!(roomName && userName && message && timeCreated)) {
				throw new Error('no sufficient data');
			}
			const insertion = this.messagesCollection.insertOne({
				roomName,
				userName,
				message,
				timeCreated,
				timeUpdated: undefined,
			})
			if(insertion && insertion.insertedId) {
				return {status: 'successful insertion', id: insertion.insertedId}
			}
		} catch (err) {
			console.log(err, "while adding message")
			throw err;
		}
	}

	async changeMessage(messageId, newMessage){
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to connect to messages db');
				}
			}
			if(!(messageId && newMessage)) {
				throw new Error('no sufficient data');
			}
			const filter = {_id: new ObjectId(messageId)}
			const updated = {$set : {message: newMessage, timeUpdated: new Date()}}
			const modification = await this.messagesCollection.updateOne(filter, updated);
			if (modification.modifiedCount === 1){
				return {status: 'successfully updated', id: messageId}
			}
		} catch (err) {
			console.log(err, "while updating message message")
			throw err;
		}
	}

	async deleteMessage(messageId) {
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to connect to messages db');
				}
			}
			if(!(messageId)) {
				throw new Error('no sufficient data');
			}
			const deletion = await this.messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
			if (deletion.deletedCount === 1) {
				return { status: 'successfully deleted', id: messageId };
			}
		} catch(err) {
			console.log('error deleting message', err);
			throw err;
		}
	}

	async deleteAllRoomMessages(roomName) {
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to get messages from room');
				}
			}
			if (!roomName) {
				console.log("no room name provided")
				throw new Error("room name wasn't provided")
			}
			const mess = await this.messagesCollection.deleteMany({roomName});
			return mess;
		} catch (err) {
			console.log('error getting room messages');
			throw err;
		}
	}
	async getRoomMessages(roomName) {
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to get messages from room');
				}
			}
			const mess = await this.messagesCollection.find({roomName}).toArray();
			return mess;
		} catch (err) {
			console.log('error getting room messages');
			throw err;
		}
	}

	async getMessageById(messageId) {
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to get messages from room');
				}
			}
			const mess = await this.messagesCollection.findOne({_id: new ObjectId(messageId)})
			return mess;
		} catch (err) {
			console.log('error getting room messages');
			throw err;
		}
	} 
}

const messageManage = new messageManager();
messageManage.connect();

export default messageManage;