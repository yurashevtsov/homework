"use strict";
const Joi = require("joi");

module.exports = {
  // joi validates based on schema created from by the library, schema has a function to call to validate passed object as a parameter
  // may lord have mercy on my naming preference
  /**
   *
   * @param {Joi.ObjectSchema} schema Joi schema object to run validation against
   * @param {string} field - string, represent field of a request object to validate
   * @returns {null}
   * @throws error if validation failed
   */
  validateSchema(schema, field = "body") {
    return async function (req, res, next) {
      try {
        const result = await schema.validateAsync(req[field]);
        
        req.body = result;
        //   if joi didnt throw an error it will call next as usual
        next();
      } catch (err) {
        next(err);
      }
    };
  },

  validateMutateQuery(schema) {
    return function (req, res, next) {
      try {
        req.query = Joi.attempt(req.query, schema);

        next();
      } catch (err) {
        next(err);
      }
    };
  },
};
