import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, closeDB, clearDB } from './setup.js';
import UserModel from '../src/models/user.model.js';

const mocks = vi.hoisted(() => ({
    userId: null
}));

vi.mock('../src/middlewares/auth.middleware.js', () => ({
    verifyJWT: (req, res, next) => {
        req.user = { _id: mocks.userId };
        next();
    }
}));

beforeAll(async () => {
    await connectDB();
});

afterEach(async () => {
    await clearDB();
    vi.clearAllMocks();
});

afterAll(async () => {
    await closeDB();
});

describe('Expense API', () => {
    let mockUserId;
    
    beforeEach(async () => {
        // Create a mock user for testing
        const user = await UserModel.create({
            username: 'testuser',
            email: 'test@test.com',
            password: 'password123',
            gamification: { points: 0, level: 1 }
        });
        mockUserId = user._id.toString();
        mocks.userId = mockUserId;
    });

    it('should upload bulk expenses successfully and award points', async () => {
        const expenses = [
            { description: 'Coffee', amount: 5, date: new Date(), category: 'Food' },
            { description: 'Train', amount: 20, date: new Date(), category: 'Transport' }
        ];

        const response = await request(app)
            .post('/home/expense/bulk')
            .send({ expenses, userId: mockUserId });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully imported 2 expenses');

        const user = await UserModel.findById(mockUserId);
        expect(user.gamification.points).toBe(50); // Should award 50 points for bulk upload
    });

    it('should fail bulk upload if payload is invalid', async () => {
        const response = await request(app)
            .post('/home/expense/bulk')
            .send({ expenses: "not an array", userId: mockUserId });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid payload for bulk upload');
    });
});
