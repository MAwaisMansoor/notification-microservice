import request from 'supertest';
import { deleteAllFromDB, postInDB } from '../../db/db.js';
import { StatusCodes } from 'http-status-codes';
import { getToken } from '../../util/jwt.js';

let server;
let user;
let app;
let event;
let notiType;
let message;
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
  template_subject: 'This is template {subject}',
  template_body: 'This is template {body}',
  created_by: 'admin',
};
const testMsg = { text: 'Test message' };
const api = '/api/messages';

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
    notiType = await postInDB(
      'notification_types',
      { ...testNotiType, event_id: event.id },
      ['id', 'name']
    );
    message = await postInDB(
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
    it('should return all messages', async () => {
      const res = await request(server)
        .get(api)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body?.result.messages?.length).toBeGreaterThan(0);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Messages found!',
      });
      expect(res.body.result.messages?.length).toBeGreaterThan(0);
      expect(res.body.result.total).toBeGreaterThan(0);
    });
  });

  describe('GET /:id', () => {
    it('should return message with specified id', async () => {
      const resMsgFound = await request(server)
        .get(`${api}/${message.id}`)
        .set('x-auth-token', getToken(user));

      expect(resMsgFound.status).toBe(StatusCodes.ACCEPTED);
      expect(resMsgFound.body?.message).toBe('Message found!');
      expect(resMsgFound.body?.result.message).toBeDefined();
    });

    it('should return 404 when not found', async () => {
      const resMsgNotFound = await request(server)
        .get(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(resMsgNotFound.status).toBe(StatusCodes.BAD_REQUEST);
      expect(resMsgNotFound.body?.message).toBe('Message not found!');
      expect(resMsgNotFound.body?.result.message).toEqual({});
    });
  });

  describe('POST /', () => {
    it('should return 400 if notifications are not provided', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({});

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body).toMatchObject({
        success: false,
        message: 'Notifications are required!',
      });
      expect(res.body.result.message).not.toBeDefined();
    });

    it('should insert message in db', async () => {
      const res = await request(server)
        .post(api)
        .set('x-auth-token', getToken(user))
        .send({
          notifications: [
            {
              application: app.name,
              event: event.name,
              notificationType: notiType.name,
              tags: { subject: 'sample subject', body: 'sample body' },
            },
          ],
        });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Notifications added!',
      });
      expect(res.body.result.messages).toBeDefined();
    });
  });

  describe('DELETE /:id', () => {
    it('should return 404 if message not found in db', async () => {
      const res = await request(server)
        .delete(`${api}/0`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete message from db', async () => {
      const res = await request(server)
        .delete(`${api}/${message.id}`)
        .set('x-auth-token', getToken(user));

      expect(res.status).toBe(StatusCodes.ACCEPTED);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Message deleted!',
      });
    });
  });
});
