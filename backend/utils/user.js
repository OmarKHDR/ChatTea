import { MongoClient } from 'mongodb';
import pkg from 'bcryptjs';
import path from 'path';

const {hash, compare} = pkg;

class UserManager {
  constructor(dbUrl = 'mongodb://127.0.0.1:27017/', dbName = 'chaiApp') {
    this.dbUrl = dbUrl;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    this.usersCollection = null;
  }

  async connect() {
    try {
        this.client = new MongoClient(this.dbUrl);
        await this.client.connect();
        console.log('Connected to MongoDB');
        this.db = this.client.db(this.dbName);

         // Check if the users collection exists, create it if it doesn't
        const collections = await this.db.listCollections().toArray();
        const userCollectionExists = collections.some(collection => collection.name === 'Users');
        if (!userCollectionExists) {
          await this.db.createCollection('Users');
          console.log('Users collection created.');
        }
        this.usersCollection = this.db.collection('Users');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }
    
  async addUser(username, password, email, socId = null, picture = '../../profilePics/profile.webp') {
    try {
      if (username === undefined || password === undefined || email === undefined) {
        throw new error('paramaters not enough');
      }
      const existingUser = await this.usersCollection.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists.');
      }
      const hashedPassword = await hash(password, 10);
      const newUser = {
        username,
        password: hashedPassword,
        socId,
        picture,
        email,
      };

      const result = await this.usersCollection.insertOne(newUser);
      if (result && result.insertedId) {
        return { message: "User created successfully" , userId : result.insertedId };
      }
        throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  async checkPassword(username, password) {
      try {
        const user = await this.usersCollection.findOne({username});
          if(!user) return false;
          return await compare(password, user.password);
      } catch (error) {
          console.error('Error checking password:', error);
          throw error;
      }
  }

  async getAllUsers() {
    try {
        return await this.usersCollection.find({}).toArray();
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async deleteUser(username) {
    try {
      const result = await this.usersCollection.deleteOne({username});
        if (result.deletedCount === 0) {
            throw new Error('User not found');
        }
        return { message: 'User deleted successfully' };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
  }

	static async getUserName(key, value) {
		try {
            const user = await this.usersCollection.findOne({ key: value});
      if(!user) {
        throw new Error('User not found');
      }
      return user.username;
    } catch (error) {
			console.error('Error getting user ID:', error);
            throw error;
		}
	}

  async updateUser(username, key, value) {
    try {
      if (!username || !key || value == null) {
        throw new Error('Invalid Input: userId, key and value are required.');
      }
      const filter = { username };
      const update = { $set: { [key]: value } }; // Dynamically creates { "key": value }
      const result =  await this.usersCollection.updateOne(filter, update);
      if (result.matchedCount === 0) {
        throw new Error('User not found for the provided user id');
      }
      return { message: 'User data updated successfully' };
    } catch(error) {
      console.error('Error adding data to user:', error);
      throw error;
    }
  }
}

import env from 'process';
const userManage = new UserManager(env.MONGO_URI || 'mongodb://127.0.0.1:27017')
userManage.connect()
export default userManage