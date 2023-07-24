import request from 'supertest';
import { deleteAllFromDB, postInDB } from '../../db/db.js';
import { StatusCodes } from 'http-status-codes';
import { getToken } from '../../util/jwt.js';

let server;
let user;
let app;
let event;
let notiType;
let msg;
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
const testMsg = {
  text: 'Sample msgs',
};
const api = '/api/notification-types';

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
    event = await postInDB('events', { ...testEvent, app_id: app.id }, ['id']);
    notiType = await postInDB(
      'notification_types',
      { ...testNotiType, event_id: event.id },
      ['id', 'name']
    );
    msg = await postInDB(
      'messages',
      { ...testMsg, noti_type_id: notiType.id },
      ['id']
    );
  });

  afterEach(async () => {
    server.close();
    await deleteAllFromDB('users');
    await deleteAllFromDB('messages');
    await deleteAllFromDB('notification_types');
    await deleteAllFromDB('events');
    await deleteAllFromDB('applications');
  });

  describe('GET /', () => {
    it('should return all notification types', async () => {
      const res = await request(server)
        .get(api)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body?.result.notificationTypes?.length).toBeGreaterThan(0);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Notification types found!',
      });
      expect(res.body.result.notificationTypes?.length).toBeGreaterThan(0);
      expect(res.body.result.total).toBeGreaterThan(0);
    });
  });

  describe('GET /:id', () => {
    it('should return notification type with specified id', async () => {
      const resNotiTypeFound = await request(server)
        .get(`${api}/${notiType.id}`)
        .set('x-auth-token', getToken(user));

      expect(resNotiTypeFound.status).toBe(StatusCodes.ACCEPTED);
      expect(resNotiTypeFound.body?.message).toBe('Notification type found!');
      expect(resNotiTypeFound.body?.result.notificationType).toBeDefined();
    });

    it('should return 404 when not found', async () => {
      const resNotiTypeNotFound = await request(server)
        .get(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(resNotiTypeNotFound.status).toBe(StatusCodes.BAD_REQUEST);
      expect(resNotiTypeNotFound.body?.message).toBe(
        'Notification type not found!'
      );
      expect(resNotiTypeNotFound.body?.result.notificationType).toEqual({});
    });
  });

  describe('GET /:id/messages', () => {
    it('should return 400 response if notification type not found', async () => {
      const res = await request(server)
        .get(`${api}/0/messages`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.message).toBe('Notification type not found!');
    });

    it('should return all messages of specified notification type', async () => {
      const res = await request(server)
        .get(`${api}/${notiType.id}/messages`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toBe('Messages found!');
      expect(res.body.result.messages.length).toBeGreaterThan(0);
    });
  });

  describe('POST /', () => {
    it('should return conflict response if the notification type already exists in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({ ...testNotiType, event_id: event.id });

      expect(res.status).toBe(StatusCodes.CONFLICT);
    });

    it('should insert notification in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({
          ...testNotiType,
          name: `New ${notiType.name}`,
          event_id: event.id,
        });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Notification type created!',
      });
      expect(res.body.result.notificationType).toBeDefined();
    });
  });

  describe('PATCH /:id', () => {
    it('should return 404 if notification type not found in db', async () => {
      const res = await request(server)
        .patch(`${api}/0`)
        .set('x-auth-token', getToken(user))
        .send({ name: 'Approved' });

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should update notification type in db', async () => {
      const res = await request(server)
        .patch(`${api}/${notiType.id}`)
        .set('x-auth-token', getToken(user))
        .send({ name: 'Approved' });

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Notification type updated!',
      });
      expect(res.body.result.notificationType).toBeDefined();
    });
  });

  describe('DELETE /:id', () => {
    it('should return 404 if notification type not found in db', async () => {
      const res = await request(server)
        .delete(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete notification type from db', async () => {
      await request(server)
        .delete(`/api/messages/${msg.id}`)
        .set('x-auth-token', getToken(user));

      const res = await request(server)
        .delete(`${api}/${notiType.id}`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Notification type deleted!',
      });
    });
  });
});
