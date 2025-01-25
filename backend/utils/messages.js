import { MongoClient,  ObjectId} from "mongodb";

class messageManager{
	constructor(dburl="mongodb://127.0.0.1:57017", dbName="chaiApp") {
		this.dbUrl = dbUrl;
		this.dbName = dbName;
		this.client = null;
		this.db = null;
		this.messagesCollection = null;
	}

	async connect(){
		try {
			this.client = await MongoClient(this.dbUrl);
			this.db = await this.client.db(this.dbName);
			const isExist = await this.db.listCollections().toArray().contains('Messages');
			if(!isExist) {
				await this.db.createCollection('Messages')
			}
			this.messagesCollection = await this.db.collection('Messages')
		} catch (err){
			console.log("error connecting to messages collection", err)
			return {status: "failed to connect to messages collection"}
		}
	}

	async addMessages(roomName, userName, message, timeCreated){
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

	static async getRoomMessages(roomName) {
		try {
			if (!this.messagesCollection) {
				await this.connect();
				if(!this.messagesCollection) {
					console.log('couldnt connect to messages collection')
					throw new Error('faild to get messages from room');
				}
			}
			this.messagesCollection.find({roomName})
		} catch (err) {
			console.log('error getting room messages');
			throw err;
		}
	}

	static async getMessageById(userName, roomName) {
		
	} 
}

const messageManage = new messageManager();
messageManage.connect();

export default messageManage;