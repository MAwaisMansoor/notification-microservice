import express from 'express';
import {
  getAllNotificationTypes,
  getNotificationTypeById,
  createNotificationType,
  editNotificationType,
  deleteNotificationType,
  getMessagesOfNotificationType,
} from '../controller/notification-type.controller.js';
import { validate } from '../model/notification-type.js';
import { validateQueryParams } from '../middleware/validate-query-params.js';

const router = express.Router();

router.get('/', validateQueryParams, getAllNotificationTypes);

router.get('/:id', getNotificationTypeById);

router.get('/:id/messages', getMessagesOfNotificationType);

router.post('/', validate, createNotificationType);

router.patch('/:id', validate, editNotificationType);

router.delete('/:id', deleteNotificationType);

export const notificationType = router;
