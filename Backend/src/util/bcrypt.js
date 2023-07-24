import bcrypt from 'bcrypt';

export const hashPassword = async (password, salt = 10) =>
  await bcrypt.hash(password, await bcrypt.genSalt(salt));

export const comparePassword = async (toCompare, toCompareWith) =>
  await bcrypt.compare(toCompare, toCompareWith);
