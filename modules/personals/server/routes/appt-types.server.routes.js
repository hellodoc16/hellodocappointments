'use strict';

module.exports = function (app) {
  // Root routing
  var appttype = require('../controllers/appt-types.server.controller');

  app.route('/api/appttypes')
    .get(appttype.list)
    .post(appttype.create);

    // Single personal routes
  app.route('/api/appttypes/:appttypeId')
    .get(appttype.read)
    .put(appttype.update)
    .delete(appttype.delete);
    
  // Finish by binding the appttype middleware
  app.param('appttypeId', appttype.apptTypeByID);
};