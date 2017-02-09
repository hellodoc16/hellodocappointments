'use strict';

var personalsApp = angular.module('personals');

personalsApp.factory('slotService', function() {
    var slotList = [];

    var addSlot = function(newObj) {
        slotList.push(newObj);
    };

    var getSlots = function() {
        return slotList;
    };

    return {
        addSlot: addSlot,
        getSlots: getSlots,
        slotList: slotList
    };

});