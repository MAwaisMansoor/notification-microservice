import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const notificationTypeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  template_subject: { type: String, required: true },
  template_body: { type: String, required: true },
  messages: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Message' }],
  event: { type: mongoose.Types.ObjectId, required: true, ref: 'Event' },
  created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

export const NotificationType = mongoose.model(
  'NotificationType',
  notificationTypeSchema
);

export const postSchema = Joi.object({
  event_id: Joi.number().required(),
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(10).max(255).required(),
  template_subject: Joi.string().min(5).max(255).required(),
  template_body: Joi.string().min(10).max(255).required(),
});

export const patchSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string().min(10).max(255),
  template_subject: Joi.string().min(5).max(255),
  template_body: Joi.string().min(10).max(255),
});

export const validate = (req, res, next) => {
  const { name, description, template_subject, template_body, event_id } =
    req.body;

  const result =
    req.method === 'POST'
      ? postSchema.validate({
          event_id,
          name,
          description,
          template_subject,
          template_body,
        })
      : patchSchema.validate({
          name,
          description,
          template_subject,
          template_body,
        });

  result.error
    ? res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error.details[0].message,
        result: {},
      })
    : next();
};
