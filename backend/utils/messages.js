import { MongoClient } from "mongodb";

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
		
	}
}