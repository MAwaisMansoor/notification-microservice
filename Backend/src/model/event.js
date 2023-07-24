import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  application: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Application',
  },
  notificationTypes: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'NotificationType',
      default: [],
    },
  ],
  created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

export const Event = mongoose.model('Event', eventSchema);

export const postSchema = Joi.object({
  app_id: Joi.number().required(),
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(10).max(255).required(),
});

export const patchSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string().min(10).max(255),
});

export const validate = (req, res, next) => {
  const { name, description, app_id } = req.body;

  const result =
    req.method === 'POST'
      ? postSchema.validate({ name, description, app_id })
      : patchSchema.validate({ name, description });

  result.error
    ? res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error.details[0].message,
        result: {},
      })
    : next();
};
