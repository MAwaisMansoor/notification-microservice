import express from 'express';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  editApplication,
  deactivateApplication,
  getEventsOfApp,
} from '../controller/application.controller.js';
import { validate } from '../model/application.js';
import { validateQueryParams } from '../middleware/validate-query-params.js';

const router = express.Router();

router.get('/', validateQueryParams, getAllApplications);

router.get('/:id', getApplicationById);

router.get('/:id/events', getEventsOfApp);

router.post('/', validate, createApplication);

router.patch('/:id', validate, editApplication);

router.delete('/:id', deactivateApplication);

export const application = router;
