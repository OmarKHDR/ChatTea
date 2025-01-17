import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

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
    
  async addUser(username, password) {
    try {
      const existingUser = await this.usersCollection.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        username,
        password: hashedPassword,
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

  async findUser(username) {
    try {
      return await this.usersCollection.findOne({ username });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

    async checkPassword(username, password) {
        try {
          const user = await this.findUser(username);
            if(!user) return false;
            return await bcrypt.compare(password, user.password);
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

}

const userManage = new UserManager()
userManage.connect()
export default userManage