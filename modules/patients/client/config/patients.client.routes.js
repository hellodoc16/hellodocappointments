'use strict';

// Setting up route
angular.module('patients').config(['$stateProvider',
  function ($stateProvider) {
    // Patients state routing
    $stateProvider
      .state('patients', {
        abstract: true,
        url: '/patients',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('patients.main', {
        url: '/main',
        templateUrl: 'modules/patients/views/list-patients.client.view.html'
      })
    //   .state('events.list', {
    //     templateUrl: 'modules/events/views/list-events.client.view.html'
    //   })
    //   .state('events.calendar', {
    //     templateUrl: 'modules/events/views/calendar-events.client.view.html'
    //   })
    //   .state('events.create', {
    //     url: '/createappointment',
    //     templateUrl: 'modules/events/views/create-events.client.view.html'
    //   });
  }
]);
