import request from 'supertest';
import app from '../app.js';

describe('POST /api/ask', () => {
  it('direct LLM (joke)', async () => {
    const res = await request(app).post('/api/ask').send({ query: 'Tell me a joke about databases.' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toBeTruthy();
  });
});
