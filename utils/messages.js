import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import process from "process";

class MessageManager {
    static dbUrl = process.env.MONGO_URI;
    static dbName = process.env.DBNAME;

    static client = null;
    static db = null;
    static messagesCollection = null;

    static async connect() {
        if (MessageManager.messagesCollection) {
            return { status: "success", reason: "connection already made" };
        }

        try {
            MessageManager.client = new MongoClient(MessageManager.dbUrl, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
            });

            await MessageManager.client.connect();
            MessageManager.db = MessageManager.client.db(MessageManager.dbName);

            const collections = await MessageManager.db.listCollections().toArray();
            const exists = collections.some(c => c.name === "Messages");

            if (!exists) {
                await MessageManager.db.createCollection("Messages");
                console.log("Messages collection created.");
            }

            MessageManager.messagesCollection = MessageManager.db.collection("Messages");
            return { status: "success", reason: exists ? "collection exists" : "collection created" };
        } catch (err) {
            console.error("Error connecting to messages collection:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async disconnect() {
        try {
            if (MessageManager.client) {
                await MessageManager.client.close();
                MessageManager.client = null;
                MessageManager.db = null;
                MessageManager.messagesCollection = null;
                console.log("Disconnected from MongoDB");
            }
            return { status: "success" };
        } catch (err) {
            return { status: "failed", reason: err.message };
        }
    }

    static async addMessage(roomName, userName, message, timeCreated) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();

            if (!(roomName && userName && message && timeCreated)) {
                return { status: "failed", reason: "insufficient data" };
            }

            const insertion = await MessageManager.messagesCollection.insertOne({
                roomName,
                userName,
                message,
                timeCreated,
                timeUpdated: undefined,
            });

            if (insertion?.insertedId) {
                return { status: "success", messageId: insertion.insertedId };
            }

            return { status: "failed", reason: "insertion failed" };
        } catch (err) {
            console.error("Error adding message:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async changeMessage(messageId, newMessage) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();

            if (!messageId || !newMessage) {
                return { status: "failed", reason: "insufficient data" };
            }

            const filter = { _id: new ObjectId(messageId) };
            const update = { $set: { message: newMessage, timeUpdated: new Date() } };
            const result = await MessageManager.messagesCollection.updateOne(filter, update);

            if (result.modifiedCount === 1) {
                return { status: "success", messageId };
            }

            return { status: "failed", reason: "no message updated" };
        } catch (err) {
            console.error("Error updating message:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async deleteMessage(messageId) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();
            if (!messageId) return { status: "failed", reason: "messageId required" };

            const deletion = await MessageManager.messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
            if (deletion.deletedCount === 1) {
                return { status: "success", messageId };
            }

            return { status: "failed", reason: "message not found" };
        } catch (err) {
            console.error("Error deleting message:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async deleteAllRoomMessages(roomName) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();
            if (!roomName) return { status: "failed", reason: "roomName required" };

            const result = await MessageManager.messagesCollection.deleteMany({ roomName });
            return { status: "success", deletedCount: result.deletedCount };
        } catch (err) {
            console.error("Error deleting room messages:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async getRoomMessages(roomName) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();
            if (!roomName) return { status: "failed", reason: "roomName required" };

            const messages = await MessageManager.messagesCollection.find({ roomName }).toArray();
            return { status: "success", messages };
        } catch (err) {
            console.error("Error fetching room messages:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async getMessageById(messageId) {
        try {
            if (!MessageManager.messagesCollection) await MessageManager.connect();
            if (!messageId) return { status: "failed", reason: "messageId required" };

            const message = await MessageManager.messagesCollection.findOne({ _id: new ObjectId(messageId) });
            if (!message) return { status: "failed", reason: "message not found" };

            return { status: "success", message };
        } catch (err) {
            console.error("Error fetching message by ID:", err.message);
            return { status: "failed", reason: err.message };
        }
    }
}

export default MessageManager;
