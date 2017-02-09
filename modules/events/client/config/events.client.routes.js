'use strict';

// Setting up route
angular.module('events').config(['$stateProvider',
  function ($stateProvider) {
    // Events state routing
    $stateProvider
      .state('events', {
        abstract: true,
        url: '/events',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('events.main', {
        url: '/main',
        templateUrl: 'modules/events/views/events.client.view.html'
      })
      .state('events.list', {
        templateUrl: 'modules/events/views/list-events.client.view.html'
      })
      .state('events.calendar', {
        templateUrl: 'modules/events/views/calendar-events.client.view.html'
      })
      .state('events.create', {
        url: '/createappointment',
        templateUrl: 'modules/events/views/create-events.client.view.html'
      });
  }
]);
