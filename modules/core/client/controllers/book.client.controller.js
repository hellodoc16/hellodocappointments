'use strict';

var coreApp = angular.module('core');

coreApp.controller('BookController', ['$scope', 'prsnlService',
  function ($scope, prsnlService) {
      
      $scope.dentist = prsnlService.getDentist();
      $scope.treatment = prsnlService.getTreatment();
      
  }
]);