import request from 'supertest';
import { deleteAllFromDB, postInDB } from '../../db/db.js';
import { StatusCodes } from 'http-status-codes';
import { getToken } from '../../util/jwt.js';

let server;
const api = '/api/users';
const testUser = {
  username: 'awais',
  password: '12345678',
  is_admin: true,
  created_by: 'admin',
};
const addUserInDB = async (returns) =>
  await postInDB('users', testUser, returns);

describe(api, () => {
  beforeEach(() => (server = require('../../index.js').server));
  afterEach(async () => {
    server.close();
    await deleteAllFromDB('users');
  });

  describe('GET /', () => {
    it('should return all users', async () => {
      const user = await addUserInDB(['id']);

      const res = await request(server)
        .get(api)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(200);
      expect(res.body?.result.users?.length).toBeGreaterThan(0);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Users found!',
      });
      expect(res.body.result.users?.length).toBeGreaterThan(0);
      expect(res.body.result.total).toBeGreaterThan(0);
    });
  });

  describe('GET /:id', () => {
    it('should return user with specified id', async () => {
      const user = await addUserInDB(['id']);

      const resUserFound = await request(server)
        .get(`/api/users/${user.id}`)
        .set('x-auth-token', getToken(user));

      expect(resUserFound.status).toBe(200);
      expect(resUserFound.body?.message).toBe('User found!');
      expect(resUserFound.body?.result.user).toBeDefined();
    });

    it('should return 404 when not found', async () => {
      const user = await addUserInDB(['id']);

      const resUserNotFound = await request(server)
        .get('/api/users/0')
        .set('x-auth-token', getToken(user));

      expect(resUserNotFound.status).toBe(404);
      expect(resUserNotFound.body?.message).toBe('User not found!');
      expect(resUserNotFound.body?.result.user).toEqual({});
    });
  });

  describe('POST /', () => {
    it('should return conflict response if the user already exists in db', async () => {
      const user = await addUserInDB(['username', 'password', 'is_admin']);

      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...user, isAdmin: user.is_admin });

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should insert user in db', async () => {
      const user = await addUserInDB(['id', 'username']);

      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({
          username: 'awais mansoor',
          password: '12345678',
          isAdmin: true,
        });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.get('x-auth-token')).toBeDefined();
      expect(res.body).toMatchObject({
        success: true,
        message: 'User created!',
      });
      expect(res.body.result.user).toBeDefined();
    });
  });

  describe('PATCH /:id', () => {
    it('should return 404 if user not found in db', async () => {
      const user = await addUserInDB(['id', 'username']);

      const res = await request(server)
        .patch(`${api}/0`)
        .set('x-auth-token', getToken(user))
        .send({ isAdmin: false });

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update user in db', async () => {
      const user = await addUserInDB(['id', 'username']);

      const res = await request(server)
        .patch(`${api}/${user.id}`)
        .set('x-auth-token', getToken(user))
        .send({ isAdmin: false });

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'User updated!',
      });
      expect(res.body.result.user).toBeDefined();
      expect(res.body.result.user.is_admin).toBeFalsy();
    });
  });

  describe('DELETE /:id', () => {
    it('should return 400 if user not found in db', async () => {
      const user = await addUserInDB(['id', 'username']);

      const res = await request(server)
        .delete(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should delete user from db', async () => {
      const user = await addUserInDB(['id', 'username']);

      const res = await request(server)
        .delete(`${api}/${user.id}`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'User deleted!',
      });
    });
  });
});
