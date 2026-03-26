const { AppError } = require('./errorHandler');

/**
 * Returns an Express middleware that validates req.body against a Joi schema.
 * @param {import('joi').ObjectSchema} schema
 */
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key,
      message: d.message.replace(/['"]/g, ''),
    }));
    const err = new AppError('Validation failed', 422, 'VALIDATION_ERROR');
    err.details = details;
    return next(err);
  }

  req.body = value;
  next();
};

module.exports = validate;
