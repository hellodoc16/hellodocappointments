'use strict';

angular.module('core').controller('HomeController', 
['$scope', '$location', '$controller', '$timeout', '$q', 'Personals', 'ApptTypes', 'prsnlService',
  function ($scope, $location, $controller, $timeout, $q, Personals, ApptTypes, prsnlService) {
    
    $scope.go = function ( path ) {
        $location.path( path );
    };
    
    $scope.nextPage = function ( ) {
        
        prsnlService.addDentist(prsnl.selectedPrsnl);
        prsnlService.addTreatment(appt.selectedAppt);
        
        if(prsnl.selectedPrsnl && appt.selectedAppt){
            $location.path('/bookappointment');
             }else{
              alert('Please select both Treatment & Doctor');
            }
    };
    
    /**
     * Search for personals... use $timeout to simulate
     * remote dataservice call.
     */
    function queryPrsnlSearch (query) {
      var results = query ? prsnl.personals.filter( createFilterFor(query) ) : prsnl.personals;
      var deferred = $q.defer();
      $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      return deferred.promise;
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(personal) {
        return (angular.lowercase(personal.fName).indexOf(lowercaseQuery) === 0);
      };
    }
    
    function selectedPrsnlChange(item) {

      if (item){
          appt.apptTypes = item.treatments;
      }
      else
        appt.apptTypes = ApptTypes.query();
    }
    
    var prsnl = this;

    prsnl.personals     = Personals.query();
    prsnl.personalsAll = prsnl.personals;
    prsnl.selectedPrsnl  = null;
    prsnl.searchPrsnl    = null;
    prsnl.simulateQuery = false;
    prsnl.isDisabled    = false;
    prsnl.queryPrsnlSearch   = queryPrsnlSearch;
    prsnl.selectedPrsnlChange = selectedPrsnlChange;

    /**
     * Search for Appts... use $timeout to simulate
     * remote dataservice call.
     */
    function queryApptSearch (query) {
      var results = query ? appt.apptTypes.filter( createFilterForAppt(query) ) : appt.apptTypes;
      var deferred = $q.defer();
      $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      return deferred.promise;
    }

    /**
     * Create filter function for a query string
     */
    function createFilterForAppt(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(apptType) {
        return (angular.lowercase(apptType.description).indexOf(lowercaseQuery) === 0);
      };
    }
    
    function selectedApptChange(item) {

      if(item)
        prsnl.personals = queryPrsnlSearchBy (item.description);
      else
        prsnl.personals = Personals.query();
        
    }
    
    /**
     * Search for personals... use $timeout to simulate
     * remote dataservice call.
     */
    function queryPrsnlSearchBy (query) {
      var results = query ? prsnl.personalsAll.filter( createFilterByTreatment(query) ) : prsnl.personalsAll;
      var deferred = $q.defer();
      $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      return deferred.promise;
    }

    /**
     * Create filter function for a query string
     */
    function createFilterByTreatment (query) {

      return function filterFn(personal) {
          if(personal)
          {
              var result = false;
              angular.forEach(personal.treatments, function(value, key){
                 if (value.description.indexOf(query) === 0)
                 {
                     result = true;
                 }
              });  
              return result;            
          }
      };
    }
    
    var appt = this;
    // list of `state` value/display objects
    appt.apptTypes     = ApptTypes.query();
    appt.selectedAppt  = null;
    appt.searchAppt    = null;
    appt.queryApptSearch   = queryApptSearch;
    appt.selectedApptChange = selectedApptChange;

    
  }
]);


