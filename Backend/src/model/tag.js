import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tagMessage = new Schema({
  text: { type: String, required: true, unique: true },
});

export const Message = mongoose.model('Tag', tagMessage);
