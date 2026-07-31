import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set environment variables for testing
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test_key';
process.env.JWT_SECRET = 'test_secret';

let mongoServer;

export const connectDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export const closeDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

export const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};
