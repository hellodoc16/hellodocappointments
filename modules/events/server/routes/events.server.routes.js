'use strict';

module.exports = function (app) {
  // Root routing
  var event = require('../controllers/events.server.controller');
  
  app.route('/api/events')
  .get(event.list)
  .post(event.create);

  app.route('/api/getEventByUser')
  .get(event.getEventByUser);

};