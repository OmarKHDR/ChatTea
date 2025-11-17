import { MongoClient, ServerApiVersion } from "mongodb";
import pkg from "bcryptjs";
import process from "process";

const { hash, compare } = pkg;

class UserManager {
	static dbUrl = process.env.MONGO_URI;
	static dbName = process.env.DBNAME;

	static client = null;
	static db = null;
	static usersCollection = null;

	static async connect() {
		if (UserManager.usersCollection)
			return { status: "success", reason: "connection already made" };
		UserManager.client = new MongoClient(UserManager.dbUrl, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});
		await UserManager.client.connect();
		console.log("Connected to MongoDB");
		UserManager.db = UserManager.client.db(UserManager.dbName);
		const collections = await UserManager.db.listCollections().toArray();
		const userCollectionExists = collections.some(
			(collection) => collection.name === "Users"
		);
		if (!userCollectionExists) {
			await UserManager.db.createCollection("Users");
			console.log("Users collection created.");
			UserManager.usersCollection = UserManager.db.collection("Users");
			return { status: "success", reason: "collection Users created" };
		}
		UserManager.usersCollection = UserManager.db.collection("Users");
		return { status: "success", reason: "collection Users already exists" };
	}

	static async disconnect() {
		try {
			if (UserManager.client) {
				await UserManager.client.close();
				UserManager.client = null;
				UserManager.db = null;
				UserManager.usersCollection = null;
				console.log("Disconnected from MongoDB");
			}
			return { status: "success" };
		} catch (err) {
			return {
				status: "failed",
				reason: `couldn't disconnect as ${err.message}`,
			};
		}
	}

	static async addUser(
		username,
		password,
		email,
		socId = null,
		picture = "../../profilePics/profile.webp"
	) {
		try {
			if (!UserManager.usersCollection) await UserManager.connect();
			if (
				username === undefined ||
				password === undefined ||
				email === undefined
			) {
				throw new Error("paramaters not enough");
			}
			const existingUser = await UserManager.usersCollection.findOne({
				username,
			});
			if (existingUser) {
				throw new Error("Username already exists.");
			}
			const hashedPassword = await hash(password, 10);
			const newUser = {
				username,
				password: hashedPassword,
				socId,
				picture,
				email,
			};

			const result = await UserManager.usersCollection.insertOne(newUser);
			if (result && result.insertedId) {
				return { status: "success", userId: result.insertedId };
			}
			throw new Error("Failed to create user");
		} catch (error) {
			console.error("Error adding user, username already exists");
			return { status: "failed", reason: error.message };
		}
	}

	static async checkPassword(username, password) {
		try {
			if (!UserManager.usersCollection) {
				const connResult= await UserManager.connect();
				console.log("Mongo connect result:", connResult);
			}
			const user = await UserManager.usersCollection.findOne({ username });
			if (!user) return false;
			return await compare(password, user.password);
		} catch (error) {
			console.error("Error checking password:", error.message);
			return false;
		}
	}

	static async getAllUsers() {
		try {
			if (!UserManager.usersCollection) await UserManager.connect();
			return await UserManager.usersCollection.find({}).toArray();
		} catch (error) {
			console.error("Error getting all users:", error.message);
			return [];
		}
	}

	static async deleteUser(username) {
		try {
			if (!UserManager.usersCollection) await UserManager.connect();
			const result = await UserManager.usersCollection.deleteOne({ username });
			if (result.deletedCount === 0) {
				throw new Error("User not found");
			}
			return { status: "success", reason: "User deleted successfully" };
		} catch (error) {
			console.error("Error deleting user:", error.message);
			return {
				status: "failed",
				reason: `user deletion failed for ${error.message}`,
			};
		}
	}

	static async getUserName(key, value) {
		try {
			if (!UserManager.usersCollection) await UserManager.connect();
			const user = await UserManager.usersCollection.findOne({ [key]: value });
			if (!user) {
				throw new Error("User not found");
			}
			return user.username;
		} catch (error) {
			console.error("Error getting user ID:", error.message);
			return;
		}
	}

	static async updateUser(username, key, value) {
		try {
			if (!UserManager.usersCollection) await UserManager.connect();
			if (!username || !key || value == null) {
				throw new Error("Invalid Input: userId, key and value are required.");
			}
			const filter = { username };
			const update = { $set: { [key]: value } }; // Dynamically creates { "key": value }
			const result = await UserManager.usersCollection.updateOne(
				filter,
				update
			);
			if (result.matchedCount === 0) {
				throw new Error("User not found for the provided user id");
			}
			return { status: "success", reason: "User data updated successfully" };
		} catch (error) {
			console.error("Error adding data to user:", error.message);
			return {
				status: "failed",
				reason: `user update failed due to ${error.message}`,
			};
		}
	}
}

export default UserManager;
