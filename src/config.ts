import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  ACCESS_TOKEN_DURATION: Joi.string().required(),
  REFRESH_TOKEN_DURATION: Joi.string().required(),
  MONGO_CONNECTION_STRING: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_AUTH_CALLBACK_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  TWITCH_CLIENT_ID: Joi.string().required(),
  TWITCH_CLIENT_SECRET: Joi.string().required(),
  TWITCH_ACCESS_TOKEN: Joi.string().required(),
  RAWG_API_KEY: Joi.string().required(),
});
