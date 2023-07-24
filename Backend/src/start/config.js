import config from 'config';

export const configurations = () => {
  if (!config.get('JWT_PRIVATE_KEY'))
    throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
};
