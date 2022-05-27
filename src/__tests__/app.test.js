const request = require('supertest');
const app = require('../app');

describe('app', () => {
  it('should export the express app correctly', () => {
    expect(app).toBeTruthy();
  });

  describe('GET /', () => {
    it('should respond to the GET method with 200', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /404', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async () => {
      const response = await request(app).get('/404');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async () => {
      const response = await request(app).post('/404');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
    });
  });

  describe('GET names', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 400 for not providing any name', async () => {
      const response = await request(app).get('/names');
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('Provide a name to lookup');
    });

    it('should respond to the GET method with a 404 for a name that is not registered', async () => {
      const response = await request(app).get('/names/lalithmedury');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"found":false}');
    });

    it('should respond to the GET method with a 200 for a name that is registered', async () => {
      const response = await request(app).get('/names/lmedury');
      expect(response.statusCode).toBe(200);
    });
  });
});
