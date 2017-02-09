'use strict';

var eventCreateApp = angular.module('events');

eventCreateApp.controller('EventsCreateController',
    ['$scope', '$googleCalendar', '$location', '$log', '$filter', '$compile', 'prsnlService', '$mdDialog', '$mdMedia', '$rootScope',
        function ($scope, $googleCalendar, $location, $log, $filter, $compile, prsnlService, $mdDialog, $mdMedia, $rootScope) {

            $scope.events = [];

            this.selectedDentist = prsnlService.getDentist();
            this.selectedTreatment = prsnlService.getTreatment();

            $scope.myDate = new Date();

            $scope.minDate = new Date();

            $scope.maxDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() + 2,
                $scope.myDate.getDate()
            );

            $.datepicker.setDefaults({
                showOn: 'both',
                buttonImageOnly: true,
                buttonImage: 'calendar.gif',
                buttonText: 'Calendar'
            });

            // Checkbox code

            $scope.items = ['Asthma', 'High Blood Presure', 'Bleeding Disorder', 'Heart Disease', 'Diabetes'];
            $scope.patientSelectedMedicalCondition = [];

            $scope.toggle = function (item, list) {
                var idx = list.indexOf(item);
                if (idx > -1) {
                    list.splice(idx, 1);
                }
                else {
                    list.push(item);
                }
            };

            $scope.exists = function (item, list) {
                return list.indexOf(item) > -1;
            };


            //Book an appointment            
            this.addEvent = function () {

                console.log('Start Time:', $scope.event.startTime);

                // var time = $scope.event.startTime.match(/^(\d+)([:\.](\d\d))?\s*((a|(p))m?)?$/i);

                // $scope.event.startDate.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
                // $scope.event.startDate.setMinutes(parseInt(time[2]) || 0);

                var time = $scope.event.startTime.match(/^(\d+)([:\.](\d\d))?\s*((a|(p))m?)?$/i);

                if (time === null) return null;

                var m = parseInt(time[3], 10) || 0;
                var hours = parseInt(time[1], 10);

                if (time[4]) time[4] = time[4].toLowerCase();

                // 12 hour time
                if (hours === 12 && !time[4]) {
                    hours = 12;
                }
                else if (hours === 12 && (time[4] === 'am' || time[4] === 'a')) {
                    hours += 12;
                }
                else if (hours < 12 && (time[4] !== 'am' && time[4] !== 'a')) {
                    hours += 12;
                }
                // 24 hour time
                else if (hours > 24 && hours.toString().length >= 3) {
                    if (hours.toString().length === 3) {
                        m = parseInt(hours.toString().substring(1, 3), 10);
                        hours = parseInt(hours.toString().charAt(0), 10);
                    }
                    else if (hours.toString().length === 4) {
                        m = parseInt(hours.toString().substring(2, 4), 10);
                        hours = parseInt(hours.toString().substring(0, 2), 10);
                    }
                }

                $scope.event.startDate.setHours(hours);
                $scope.event.startDate.setMinutes(m);

                console.log('Start Date:', $scope.event.startDate);

                //format end date/time object in to google format
                var endDate = new Date($scope.event.startDate);
                endDate.setMinutes(endDate.getMinutes() + this.selectedTreatment.duration);
                console.log('End Date:', endDate);

                $scope.patientInfo = {
                    patientName: $scope.event.patientName,
                    patientAge: $scope.event.patientAge,
                    patientGender: $scope.event.patientGender,
                    patientPlace: $scope.event.patientPlace,
                    contact: $scope.event.patientPhoneNumber,
                    emailId: $scope.event.patientEmail,
                    patientSelectedMedicalCondition: $scope.patientSelectedMedicalCondition,
                    patientChiefComplaint: $scope.event.patientChiefComplaint,
                };

                $rootScope.patient = $scope.patientInfo.patientName;
                $rootScope.dateTime = $scope.event.startDate;
                $rootScope.endTime = endDate;

                var contactInfo = {
                    doctorName: this.selectedDentist.fName + ' ' + this.selectedDentist.lName,
                    emailId: this.selectedDentist.emailId,
                    treatment: this.selectedTreatment.description
                };

                $googleCalendar.addEvent($scope.event.startDate, endDate, contactInfo, $scope.patientInfo)
                    .then(function (result) {
                        console.log('Add Event Result:', result);
                        $scope.showSuccess();


                    }, function (result) {
                        $scope.showFailed();
                    });

            };

            this.updateTime = function () {

                $scope.notavailable = '';

                var _date = $filter('date')(new Date($scope.event.startDate), 'EEEE');

                $('#timePick').timepicker('remove');

                var startDate = new Date($scope.event.startDate);
                startDate.setHours(0, 0, 0, 0);

                var endDate = new Date($scope.event.startDate);
                endDate.setHours(23, 59, 59, 999);

                for (var index = 0; index < this.selectedDentist.slots.length; index++) {

                    var slot = this.selectedDentist.slots[index];

                    $scope.event.minTime = $filter('date')(new Date(slot.starttime), 'shortTime');
                    $scope.event.maxTime = $filter('date')(new Date(slot.endtime), 'shortTime');
                    $scope.event.step = this.selectedTreatment.duration;

                    if (slot.day === _date) {
                        $googleCalendar.getEventByUser(this.selectedDentist, startDate, endDate)
                            .then(function (events) {

                                var eventArray = [];

                                events.forEach(function (element) {
                                    var event = [];
                                    event.push(new Date(element.start.dateTime).toLocaleTimeString());
                                    event.push(new Date(element.end.dateTime).toLocaleTimeString());
                                    eventArray.push(event);
                                }, this);

                                $(document).ready(function () {
                                    $('#timePick').timepicker({
                                        'minTime': $scope.event.minTime,
                                        'maxTime': $scope.event.maxTime,
                                        'step': '15',
                                        // 'step': function (i) {
                                        //     return (i % 2) ? 15 : 15;
                                        // },
                                        'disableTextInput': true,
                                        'timeFormat': 'g:ia',
                                        'disableTimeRanges': eventArray
                                    });


                                });
                            });

                        $scope.notavailable = '';
                        break;
                    }
                    else {
                        $scope.notavailable = 'No Slots Available for the selected date';   //$scope.notavailable = '';
                    }
                }
            };

            function DialogController($scope, $mdDialog, prsnlService) {
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };
                $scope.selectedDentist = prsnlService.getDentist();
                $scope.selectedTreatment = prsnlService.getTreatment();

                $scope.displayName = $rootScope.patient;
                $scope.displayDateTime = $rootScope.dateTime;
                $scope.displayTime = $rootScope.endTime;
            }

            $scope.showFailed = function () {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'modules/events/views/failed.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                })
                    .then(function (answer) {
                        $location.path('/');
                    }, function () {
                        $location.path('/');
                    });
                $scope.$watch(function () {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function (wantsFullScreen) {
                    $scope.customFullscreen = (wantsFullScreen === true);
                });
            };

            $scope.showSuccess = function () {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'modules/events/views/success.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                })
                    .then(function (answer) {
                        $location.path('/');
                    }, function () {
                        $location.path('/');
                    });
                $scope.$watch(function () {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function (wantsFullScreen) {
                    $scope.customFullscreen = (wantsFullScreen === true);
                });
            };

        }]);