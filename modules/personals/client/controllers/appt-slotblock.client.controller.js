'use strict';

var personalsApp = angular.module('personals');

personalsApp.controller('ApptSlotBlockController', ['$scope', function ($scope) {

    //Calendar
    $scope.myDate = new Date();
    $scope.minDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate());

    //BlockSlots
    //  $scope.slot = [];

    $scope.blockCalendar = function () {
        $scope.slot.push({
            startdate: $scope.slot.startdate,
            enddate: $scope.slot.enddate
        });
    };
}]);
