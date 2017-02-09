'use strict';

// Personals controller

var personalsApp = angular.module('personals');

personalsApp.directive('onErrorSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    };
});

personalsApp.controller('PersonalsController', ['$scope', '$stateParams', 'Personals', '$uibModal', '$log', '$q', 'slotService', '$mdDialog', '$mdMedia', '$googleCalendar', '$mdToast',
    function ($scope, $stateParams, Personals, $uibModal, $log, $q, slotService, $mdDialog, $mdMedia, $googleCalendar, $mdToast) {

        // Find a list of Personals
        this.personals = Personals.query();

        console.log(this.personals);

        // Open a modal window to create a single personal record

        this.modelCreate = function (size) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/personals/views/create-personal.client.view.html',

                controller: function ($scope, $uibModalInstance) {

                    $scope.ok = function () {
                        $uibModalInstance.close($scope.personal);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                },
                size: size
            });

            modalInstance.result.then(function (selectedItem)
            { $scope.selected = selectedItem; }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };

        // Open a modal window to update a single personal record
        this.modelUpdate = function (size, selectedPersonal) {

            var elements = [];
            for (var index = 0; index < selectedPersonal.treatments.length; index++) {
                var element = selectedPersonal.treatments[index];

                elements[index] = {
                    description: element.description,
                    duration: element.duration,
                    price: element.price,
                    longDescription: element.longDescription,
                    checked: true
                };
            }

            selectedPersonal.treatments = elements;

            console.log(selectedPersonal);

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/personals/views/edit-personal.client.view.html',
                controller: function ($scope, $uibModalInstance, selectedPersonal) {

                    $scope.personal = selectedPersonal;

                    $scope.ok = function () {
                        $uibModalInstance.close($scope.personal);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                },
                size: size,
                resolve: {
                    selectedPersonal: function () {
                        return selectedPersonal;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {

            });


        };

        // Open a modal window to update a single personal record
        this.modelSchedule = function (size, selectedPersonal) {

            var modalInstance = $uibModal.open({

                animation: $scope.animationsEnabled,

                templateUrl: 'modules/personals/views/list-apptslots.client.view.html',

                controller: function ($scope, $uibModalInstance, selectedPersonal, slotService) {

                    $scope.personal = selectedPersonal;
                    slotService.slotList = selectedPersonal.slots;

                    //console.log($scope.slotList);

                    $scope.ok = function () {
                        $uibModalInstance.close($scope.personal);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                },

                size: size,

                resolve: {
                    selectedPersonal: function () {
                        return selectedPersonal;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {

            });
        };

        // Remove existing Personal
        this.remove = function (personal) {

            if (confirm('Are you sure you want to delete this user?')) {
                if (personal) {

                    personal.$remove();

                    for (var i in this.personals) {
                        if (this.personals[i] === personal) {
                            this.personals.splice(i, 1);
                        }
                    }

                } else {
                    this.personal.$remove(function () { });
                }
            }
        };

        // Open a modal window to block slot a single personal record

        this.modelBlock = function (selectedPersonal) {

            function DialogController($scope, $mdDialog, personal, $googleCalendar, $mdToast) {

                $scope.personal = personal;

                $scope.myDate = new Date();

                $scope.minDate = new Date(
                    $scope.myDate.getFullYear(),
                    $scope.myDate.getMonth(),
                    $scope.myDate.getDate());

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.blockCalendar = function (personal) {

                    var startDate = new Date($scope.startDate);
                    startDate.setHours(0, 0, 0, 0);

                    var endDate = new Date($scope.endDate);
                    endDate.setHours(23, 59, 59, 999);

                    $googleCalendar.addEvent(startDate, endDate, personal, null)
                        .then(function (result) {

                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Successfully Appointment Slot Blocked!')
                                    .position('top right')
                                    .hideDelay(3000)
                            );


                            console.log('Add Event Result:', result);
                            // $scope.showSuccess();


                        }, function (result) {
                            
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Unable to block the Appointment Slot!')
                                    .position('top right')
                                    .hideDelay(3000)
                            );
                            
                            console.log('Failed Event Result:', result);
                            // $scope.showFailed();
                        });

                    $mdDialog.hide();

                };

            }

            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'modules/personals/views/list-apptslotsblock.client.view.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: useFullScreen,
                locals: {
                    personal: selectedPersonal
                }
            });

            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

    }
]);
