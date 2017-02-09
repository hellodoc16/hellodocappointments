'use strict';

/**
 * Module dependencies.
 */
var personalsPolicy = require('../policies/personals.server.policy'),
  personals = require('../controllers/personals.server.controller');

module.exports = function (app) {
  // Personals collection routes
  app.route('/api/personals').all(personalsPolicy.isAllowed)
    .get(personals.list)
    .post(personals.create);

  // Single personal routes
  app.route('/api/personals/:personalId').all(personalsPolicy.isAllowed)
    .get(personals.read)
    .put(personals.update)
    .delete(personals.delete);
    
  app.route('/api/personal/picture')
  .post(personals.createPersonalPicture);

  // Finish by binding the personal middleware
  app.param('personalId', personals.personalByID);
};
