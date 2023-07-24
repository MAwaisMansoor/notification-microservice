import request from 'supertest';
import { deleteAllFromDB, postInDB } from '../../db/db.js';
import { StatusCodes } from 'http-status-codes';
import { getToken } from '../../util/jwt.js';

let server;
let user;
let app;
let event;
const testApp = {
  name: 'ETS',
  description: 'Employee Training System',
  is_active: true,
  created_by: 'admin',
};
const testEvent = {
  name: 'Assignment',
  description: 'Training Assigned',
  created_by: 'admin',
};
const api = '/api/applications';

describe(api, () => {
  beforeEach(async () => {
    server = require('../../index.js').server;
    user = await postInDB(
      'users',
      {
        username: 'awais',
        password: '12345678',
        is_admin: true,
        created_by: 'admin',
      },
      ['id']
    );
    app = await postInDB('applications', testApp, ['id', 'name']);
    event = await postInDB('events', { ...testEvent, app_id: app.id }, [
      'id',
      'name',
    ]);
  });

  afterEach(async () => {
    server.close();
    await deleteAllFromDB('users');
    await deleteAllFromDB('events');
    await deleteAllFromDB('applications');
  });

  describe('GET /', () => {
    it('should return all applications', async () => {
      const res = await request(server)
        .get(api)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(200);
      expect(res.body?.result.applications?.length).toBeGreaterThan(0);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Applications found!',
      });
      expect(res.body.result.applications?.length).toBeGreaterThan(0);
      expect(res.body.result.total).toBeGreaterThan(0);
    });
  });

  describe('GET /:id', () => {
    it('should return app with specified id', async () => {
      const resAppFound = await request(server)
        .get(`/api/applications/${app.id}`)
        .set('x-auth-token', getToken(user));

      expect(resAppFound.status).toBe(200);
      expect(resAppFound.body?.message).toBe('Application found!');
      expect(resAppFound.body?.result.application).toBeDefined();
    });

    it('should return 404 when not found', async () => {
      const resAppNotFound = await request(server)
        .get('/api/applications/0')
        .set('x-auth-token', getToken(user));

      expect(resAppNotFound.status).toBe(StatusCodes.BAD_REQUEST);
      expect(resAppNotFound.body?.message).toBe('Application not found!');
      expect(resAppNotFound.body?.result.application).toEqual({});
    });
  });

  describe('GET /:id/events', () => {
    it('should return 400 response if application not found', async () => {
      const res = await request(server)
        .get(`${api}/0/events`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.message).toBe('Application not found!');
    });

    it('should return all events of specified application', async () => {
      const res = await request(server)
        .get(`${api}/${app.id}/events`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toBe('Events found!');
      expect(res.body.result.events.length).toBeGreaterThan(0);
    });
  });

  describe('POST /', () => {
    it('should return conflict response if the app already exists in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...testApp, isActive: true });

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should insert app in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...testApp, name: `New ${app.name}`, isActive: true });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Application created!',
      });
      expect(res.body.result.application).toBeDefined();
    });
  });

  describe('PATCH /:id', () => {
    it('should return 404 if app not found in db', async () => {
      const res = await request(server)
        .patch(`${api}/0`)
        .set('x-auth-token', getToken(user))
        .send({ isActive: false });

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update app in db', async () => {
      const res = await request(server)
        .patch(`${api}/${app.id}`)
        .set('x-auth-token', getToken(user))
        .send({ isActive: false });

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Application updated!',
      });
      expect(res.body.result.application).toBeDefined();
      expect(res.body.result.application.is_active).toBeFalsy();
    });
  });

  describe('DELETE /:id', () => {
    it('should return 404 if app not found in db', async () => {
      const res = await request(server)
        .delete(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete app from db', async () => {
      const res = await request(server)
        .delete(`${api}/${app.id}`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Application deactivated!',
      });
      expect(res.body.result.application.isActive).toBeFalsy();
    });
  });
});
