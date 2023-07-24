import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  editUser,
  deleteUser,
} from '../controller/user.controller.js';
import { validate } from '../model/user.js';
import { validateQueryParams } from '../middleware/validate-query-params.js';

const router = express.Router();

router.get('/', validateQueryParams, getAllUsers);

router.get('/:id', getUserById);

router.post('/', validate, createUser);

router.patch('/:id', validate, editUser);

router.delete('/:id', deleteUser);

export const user = router;
