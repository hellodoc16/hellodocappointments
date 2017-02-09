'use strict';

var personalsApp = angular.module('personals');

personalsApp.directive('listPersonal', ['Personals', 'Notify',
    function(Personals, Notify) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'modules/personals/views/view-personal.client.view.html',
            link: function($scope, element, attrs) {
                //when a new personal is added, update the personal list

                Notify.getMsg('NewPersonal', function(event, data) {
                    $scope.personalsCtrl.personals = Personals.query();
                });
            }
        };
    }]);