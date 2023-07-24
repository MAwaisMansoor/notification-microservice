import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  editEvent,
  deleteEvent,
  getNotificationTypesOfEvent,
} from '../controller/event.controller.js';
import { validate } from '../model/event.js';
import { validateQueryParams } from '../middleware/validate-query-params.js';

const router = express.Router();

router.get('/', validateQueryParams, getAllEvents);

router.get('/:id', getEventById);

router.get('/:id/notification-types', getNotificationTypesOfEvent);

router.post('/', validate, createEvent);

router.patch('/:id', validate, editEvent);

router.delete('/:id', deleteEvent);

export const event = router;
