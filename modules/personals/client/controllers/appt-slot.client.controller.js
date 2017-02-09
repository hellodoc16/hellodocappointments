'use strict';

var personalsApp = angular.module('personals');

personalsApp.controller('ApptSlotController', ['$scope', 'slotService',
    function($scope, slotService) {

        $scope.slotList = slotService.slotList;
        $scope.slot = [];
        $scope.disabled = false;

        $scope.dayOptions = [
            { label: 'Monday' },
            { label: 'Tuesday' },
            { label: 'Wednesday' },
            { label: 'Thursday' },
            { label: 'Friday' },
            { label: 'Saturday' },
            { label: 'Sunday' }
        ];


        var refresh = function(personal) {
            console.log(personal);
            slotService.slotList = personal.slots;
            $scope.slot = '';
            $scope.disabled = false;
        };

        // Create new Appt Slot
        $scope.addSlots = function() {
            console.log(slotService.slotList);
            slotService.slotList.push({
                day: $scope.slot.selectedDay.label,
                location: $scope.slot.location,
                starttime: $scope.slot.starttime,
                endtime: $scope.slot.endtime

            });

            $scope.slotList = slotService.slotList;
        };

        // Remove existing Slot
        $scope.remove = function(personal, slot) {
            if (slot) {

                for (var i in this.slotList) {
                    if (this.slotList[i] === slot) {
                        this.slotList.splice(i, 1);
                    }
                }
            } else {
                this.slot.$remove(function() {

                });
            }

        };

        // Update existing Slot
        $scope.update = function(personal) {

            personal.slots = [];

            for (var index = 0; index < slotService.slotList.length; index++) {
                personal.slots.push(
                    {
                        day: slotService.slotList[index].day,
                        starttime: slotService.slotList[index].starttime,
                        endtime: slotService.slotList[index].endtime,
                        location: slotService.slotList[index].location
                    }
                );
            }

            personal.$update(function() {
                refresh(personal);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.log(errorResponse.data.message);
            });
        };

        $scope.edit = function(slot) {

            for (var i in this.slotList) {
                if (this.slotList[i] === slot) {
                    $scope.slot = slot;
                }
            }

            $scope.disabled = true;
        };

        $scope.deselect = function() {
            $scope.slot = '';
            $scope.disabled = false;
        };

    }
]);