import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: { type: String, required: true },
  noti_type_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'NotificationType',
  },
});

export const Message = mongoose.model('Message', messageSchema);

export const schema = Joi.object({
  application: Joi.string().min(3).max(30).required(),
  event: Joi.string().min(3).max(30).required(),
  notificationType: Joi.string().min(3).max(30).required(),
  tags: Joi.object(),
});
