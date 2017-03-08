'use strict';

var personalsApp = angular.module('personals');

personalsApp.controller('ApptTypeController', ['$scope', 'ApptTypes',
    function($scope, ApptTypes) {

        $scope.procedureList = [];
        $scope.procedure = [];
        $scope.disabled = false;

        var refresh = function() {
            $scope.procedureList = ApptTypes.query();
            $scope.procedure = '';
            $scope.disabled = false;
        };

        refresh();

        // Create new Appt Type
        $scope.addProcedure = function() {

            // Create new Appt Type object
            var apptType = new ApptTypes({
                description: $scope.procedure.description,
                duration: $scope.procedure.duration,
                price: $scope.procedure.price,
                longDescription: $scope.procedure.longDescription,

            });

            // Redirect after save
            apptType.$save(function(response) {

                // Clear form fields
                $scope.procedure.description = '';
                $scope.procedure.duration = '';
                $scope.procedure.price = '';
                $scope.procedure.longDescription = '';

                refresh();

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing procedure
        $scope.remove = function(procedure) {
            if (confirm('Are you sure you want to delete this procedure?')) {
                if (procedure) {

                    procedure.$remove();

                    for (var i in this.procedureList) {
                        if (this.procedureList[i] === procedure) {
                            this.procedureList.splice(i, 1);
                        }
                    }
                } else {
                    this.procedure.$remove(function() {

                    });
                }
            }
        };

        // Update existing Personal
        $scope.update = function(updtprocedure) {

            var procedure = updtprocedure;

            procedure.$update(function() {
                refresh();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.log(errorResponse.data.message);
            });
        };

        $scope.edit = function(procedure) {

            for (var i in this.procedureList) {
                if (this.procedureList[i] === procedure) {
                    $scope.procedure = procedure;
                }
            }

            $scope.disabled = true;
        };

        $scope.deselect = function() {
            $scope.procedure = '';
            $scope.disabled = false;
        };

    }
]);