import { MongoClient, ServerApiVersion } from 'mongodb';
import process from 'process';

class RoomManager {
    static dbUrl = process.env.MONGO_URI;
    static dbName = process.env.DBNAME;

    static client = null;
    static db = null;
    static roomsCollection = null;

    static async connect() {
        if (RoomManager.roomsCollection) {
            return { status: "success", reason: "connection already made" };
        }

        RoomManager.client = new MongoClient(RoomManager.dbUrl, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await RoomManager.client.connect();
        console.log("Connected to MongoDB");

        RoomManager.db = RoomManager.client.db(RoomManager.dbName);

        const collections = await RoomManager.db.listCollections().toArray();
        const exists = collections.some(c => c.name === "Rooms");

        if (!exists) {
            await RoomManager.db.createCollection("Rooms");
            console.log("Rooms collection created.");
            RoomManager.roomsCollection = RoomManager.db.collection("Rooms");
            return { status: "success", reason: "collection Rooms created" };
        }

        RoomManager.roomsCollection = RoomManager.db.collection("Rooms");
        return { status: "success", reason: "collection Rooms already exists" };
    }

    static async disconnect() {
        try {
            if (RoomManager.client) {
                await RoomManager.client.close();
                RoomManager.client = null;
                RoomManager.db = null;
                RoomManager.roomsCollection = null;
                console.log("Disconnected from MongoDB");
            }
            return { status: "success" };
        } catch (err) {
            return { status: "failed", reason: `couldn't disconnect as ${err.message}` };
        }
    }

    static async createRoom(roomName, picture = "../../roomPics/default.jpg", roomDescription = "no description", members = [], admins = []) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();
            if (!roomName) throw new Error("room name required");

            const roomExists = await RoomManager.roomsCollection.findOne({ roomName });
            if (roomExists) {
                return { status: "failed", reason: "room already exists" };
            }

            const result = await RoomManager.roomsCollection.insertOne({
                roomName,
                picture,
                description: roomDescription,
                members,
                admins
            });

            if (result && result.insertedId) {
                return { status: "success", roomId: result.insertedId };
            }

            throw new Error("Failed to create room");
        } catch (err) {
            console.error("Error creating room:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async addMember(username, roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();

            const filter = { roomName };
            const update = { $addToSet: { members: username } };
            const result = await RoomManager.roomsCollection.updateOne(filter, update);

            if (result.matchedCount === 0) {
                throw new Error("Room not found");
            }

            return { status: "success" };
        } catch (err) {
            console.error("Error adding member:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async removeMember(username, roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();

            const filter = { roomName };
            const update = { $pull: { members: username } };
            const result = await RoomManager.roomsCollection.updateOne(filter, update);

            if (result.matchedCount === 0) {
                throw new Error("Room not found");
            }

            return { status: "success" };
        } catch (err) {
            console.error("Error removing member:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async addAdmin(username, roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();

            const filter = { roomName };
            const update = { $addToSet: { admins: username } };
            const result = await RoomManager.roomsCollection.updateOne(filter, update);

            if (result.matchedCount === 0) {
                throw new Error("Room not found");
            }

            return { status: "success" };
        } catch (err) {
            console.error("Error adding admin:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async removeAdmin(username, roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();

            const filter = { roomName };
            const update = { $pull: { admins: username } };
            const result = await RoomManager.roomsCollection.updateOne(filter, update);

            if (result.matchedCount === 0) {
                throw new Error("Room not found");
            }

            return { status: "success" };
        } catch (err) {
            console.error("Error removing admin:", err.message);
            return { status: "failed", reason: err.message };
        }
    }

    static async listAdmins(roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();
            const room = await RoomManager.roomsCollection.findOne({ roomName });
            return room?.admins || [];
        } catch (err) {
            console.error("Error listing admins:", err.message);
            return [];
        }
    }

    static async listMembers(roomName) {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();
            const room = await RoomManager.roomsCollection.findOne({ roomName });
            return room?.members || [];
        } catch (err) {
            console.error("Error listing members:", err.message);
            return [];
        }
    }

    static async listRooms() {
        try {
            if (!RoomManager.roomsCollection) await RoomManager.connect();
            return await RoomManager.roomsCollection.find({}, { projection: { roomName: 1, _id: 0 } }).toArray();
        } catch (err) {
            console.error("Error listing rooms:", err.message);
            return [];
        }
    }
}

export default RoomManager;
