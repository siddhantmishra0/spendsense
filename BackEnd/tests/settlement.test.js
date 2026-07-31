import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, closeDB, clearDB } from './setup.js';
import UserModel from '../src/models/user.model.js';
import SettlementModel from '../src/models/settlement.model.js';

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

describe('Settlement API', () => {
    let mockUser1Id;
    let mockUser2Id;
    
    beforeEach(async () => {
        const user1 = await UserModel.create({
            username: 'alice',
            email: 'alice@test.com',
            password: 'password123',
            gamification: { points: 0, level: 1 }
        });
        mockUser1Id = user1._id.toString();

        const user2 = await UserModel.create({
            username: 'bob',
            email: 'bob@test.com',
            password: 'password123',
            gamification: { points: 0, level: 1 }
        });
        mockUser2Id = user2._id.toString();
        mocks.userId = mockUser1Id;
    });

    it('should create a settlement successfully', async () => {
        const payload = {
            description: 'Lunch',
            amount: 100,
            paidBy: mockUser1Id,
            splitAmong: [
                { user: mockUser2Id, amountOwed: 50, hasSettled: false }
            ]
        };

        const response = await request(app)
            .post('/api/v1/settlements')
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.description).toBe('Lunch');
        expect(response.body.splitAmong.length).toBe(1);
    });

    it('should allow settling up a debt', async () => {
        // First create a settlement manually in DB
        const settlement = await SettlementModel.create({
            description: 'Movie',
            amount: 40,
            paidBy: mockUser1Id,
            splitAmong: [
                { user: mockUser2Id, amountOwed: 20, hasSettled: false }
            ]
        });

        // Settle up
        const response = await request(app)
            .put('/api/v1/settlements/settle')
            .send({
                settlementId: settlement._id.toString(),
                userId: mockUser2Id
            });

        expect(response.status).toBe(200);
        expect(response.body.splitAmong[0].hasSettled).toBe(true);
    });
});
