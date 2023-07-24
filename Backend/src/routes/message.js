import express from 'express';
import {
  getAllMessages,
  getMessageById,
  createMessage,
  deleteMessage,
} from '../controller/message.controller.js';

const router = express.Router();

router.get('/', getAllMessages);

router.get('/:id', getMessageById);

router.post('/', createMessage);

router.delete('/:id', deleteMessage);

export const message = router;
