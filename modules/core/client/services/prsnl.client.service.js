'use strict';

var coreApp = angular.module('core');

coreApp.factory('prsnlService', function() {
  var selectedDentist = [];
  var selectedTreatment = [];
  
  var addDentist = function(dentist) {
      selectedDentist = dentist;
  };
  
  var addTreatment = function(treatment) {
      selectedTreatment = treatment;
  };

  var getDentist = function(){
      return selectedDentist;
  };
  
  var getTreatment = function(){
      return selectedTreatment;
  };

  return {
    addDentist: addDentist,
    getDentist: getDentist,
    selectedDentist: selectedDentist,
    addTreatment: addTreatment,
    getTreatment: getTreatment,
    selectedTreatment: selectedTreatment
  };

});