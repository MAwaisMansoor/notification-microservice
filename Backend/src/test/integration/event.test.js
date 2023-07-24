import request from 'supertest';
import { deleteAllFromDB, postInDB } from '../../db/db.js';
import { StatusCodes } from 'http-status-codes';
import { getToken } from '../../util/jwt.js';

let server;
let user;
let notiType;
let event;
let app;
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
const testNotiType = {
  name: 'Training Assigned',
  description: 'Training Assigned',
  template_subject: 'This is template subject',
  template_body: 'This is template body',
  created_by: 'admin',
};
const api = '/api/events';

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
    app = await postInDB('applications', testApp, ['id']);
    event = await postInDB('events', { ...testEvent, app_id: app.id }, [
      'id',
      'name',
    ]);
    notiType = await postInDB(
      'notification_types',
      { ...testNotiType, event_id: event.id },
      ['id', 'name']
    );
  });

  afterEach(async () => {
    server.close();
    await deleteAllFromDB('users');
    await deleteAllFromDB('notification_types');
    await deleteAllFromDB('events');
    await deleteAllFromDB('applications');
  });

  describe('GET /', () => {
    it('should return all events', async () => {
      const res = await request(server)
        .get(api)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(200);
      expect(res.body?.result.events?.length).toBeGreaterThan(0);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Events found!',
      });
      expect(res.body.result.events?.length).toBeGreaterThan(0);
      expect(res.body.result.total).toBeGreaterThan(0);
    });
  });

  describe('GET /:id', () => {
    it('should return event with specified id', async () => {
      const resEventFound = await request(server)
        .get(`/api/events/${event.id}`)
        .set('x-auth-token', getToken(user));

      expect(resEventFound.status).toBe(StatusCodes.ACCEPTED);
      expect(resEventFound.body?.message).toBe('Event found!');
      expect(resEventFound.body?.result.event).toBeDefined();
    });

    it('should return 404 when not found', async () => {
      const resEventNotFound = await request(server)
        .get('/api/events/0')
        .set('x-auth-token', getToken(user));

      expect(resEventNotFound.status).toBe(StatusCodes.BAD_REQUEST);
      expect(resEventNotFound.body?.message).toBe('Event not found!');
      expect(resEventNotFound.body?.result.event).toEqual({});
    });
  });

  describe('GET /:id/notification-types', () => {
    it('should return 400 response if event not found', async () => {
      const res = await request(server)
        .get(`${api}/0/notification-types`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.message).toBe('Event not found!');
    });

    it('should return all notification types of specified event', async () => {
      const res = await request(server)
        .get(`${api}/${event.id}/notification-types`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toBe('Notification types found!');
      expect(res.body.result.notificationTypes.length).toBeGreaterThan(0);
    });
  });

  describe('POST /', () => {
    it('should return conflict response if the event already exists in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...testEvent, app_id: app.id });

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should insert event in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...testEvent, name: `New ${event.name}`, app_id: app.id });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Event created!',
      });
      expect(res.body.result.event).toBeDefined();
    });
  });

  describe('PATCH /:id', () => {
    it('should return 404 if event not found in db', async () => {
      const res = await request(server)
        .patch(`${api}/0`)
        .set('x-auth-token', getToken(user))
        .send({ name: 'Approved' });

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update event in db', async () => {
      const res = await request(server)
        .patch(`${api}/${event.id}`)
        .set('x-auth-token', getToken(user))
        .send({ name: 'Approved' });

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Event updated!',
      });
      expect(res.body.result.event).toBeDefined();
    });
  });

  describe('DELETE /:id', () => {
    it('should return 404 if event not found in db', async () => {
      const res = await request(server)
        .delete(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete event from db', async () => {
      await request(server)
        .delete(`/api/notification-types/${notiType.id}`)
        .set('x-auth-token', getToken(user));

      const res = await request(server)
        .delete(`${api}/${event.id}`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Event deleted!',
      });
    });
  });
});
