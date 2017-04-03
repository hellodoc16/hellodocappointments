'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = [
    'ngResource',
    'ngAnimate',
    'ngCookies',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'GoogleCalendarService',
    'EventUtil',
    'ui.timepicker',
    'ngMaterial',
    'angularMoment',
    'angular-input-stars',
    'angularFileUpload'
  ];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function ($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {
  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        $state.go('authentication.signin', {}, {
          notify: false
        }).then(function () {
          $rootScope.$broadcast('$stateChangeSuccess', 'authentication.signin', {}, toState, toParams);
        });
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $state.previous = {
      state: fromState,
      params: fromParams,
      href: $state.href(fromState, fromParams)
    };
  });
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') {
    window.location.hash = '#!';
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('events');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('patients');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('personals');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise('not-found');

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/views/home.client.view.html'
      })
      .state('bookappointment', {
        url: '/bookappointment',
        templateUrl: 'modules/core/views/book.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/views/404.client.view.html'
      });
  }
]);

'use strict';

var coreApp = angular.module('core');

coreApp.controller('BookController', ['$scope', 'prsnlService',
  function ($scope, prsnlService) {
      
      $scope.dentist = prsnlService.getDentist();
      $scope.treatment = prsnlService.getTreatment();
      
  }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

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
        prsnl.personals = queryPrsnlSearchByWOTimeOut (item.description);
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

    function queryPrsnlSearchByWOTimeOut (query) {
      var results = query ? prsnl.personalsAll.filter( createFilterByTreatment(query) ) : prsnl.personalsAll;
      return results;
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



'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? true : options.isPublic),
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].isPublic : options.isPublic),
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].roles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.link, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : options.isPublic),
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      isPublic: false
    });
  }
]);

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
'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Events module
angular.module('events',['ui.calendar']).run(['Menus',
  function (Menus) {
    // Add the events dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Appointments',
      state: 'events.main'
    });
  }
]);

'use strict';

// Setting up route
angular.module('events').config(['$stateProvider',
  function ($stateProvider) {
    // Events state routing
    $stateProvider
      .state('events', {
        abstract: true,
        url: '/events',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('events.main', {
        url: '/main',
        templateUrl: 'modules/events/views/events.client.view.html'
      })
      .state('events.list', {
        templateUrl: 'modules/events/views/list-events.client.view.html'
      })
      .state('events.calendar', {
        templateUrl: 'modules/events/views/calendar-events.client.view.html'
      })
      .state('events.create', {
        url: '/createappointment',
        templateUrl: 'modules/events/views/create-events.client.view.html'
      });
  }
]);

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
            DialogController.$inject = ["$scope", "$mdDialog", "prsnlService"];

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
'use strict';

var eventsApp = angular.module('events');

eventsApp.controller('EventsController', ['$scope', '$googleCalendar', '$uibModal', '$log', '$mdSidenav',
    function ($scope, $googleCalendar, $uibModal, $log, $mdSidenav) {


        //================================================================================
        // Variables
        //================================================================================

        $scope.events = [];
        $scope.calEvents = [];
        $scope.eventSources = [];
        $scope.isCalendarView = true;
        $scope.isTableView = false;
        $scope.isSidenavOpen = false;

        /* config object */
        $scope.uiConfig = {
            calendar: {
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
                editable: false,

                aspectRatio: 1.5,

                header: {
                    left: 'month,agendaWeek,agendaDay,verticalResourceView',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventLimit: true,
                navLinks: true,
                views: {
                    verticalResourceView: {
                        type: 'timeline',
                        duration: { days: 1 },
                        buttonText: 'day by doctor',

                    },
                    agendaDay: {
                        resources: false
                    }
                },
                minTime: '8:00',
                maxTime: '21:00',

                resourceAreaWidth: '20%',
                resourceLabelText: 'Doctors',

                resources: [
                    { id: 'Dr. Siddharth Kumar', title: 'Dr. Siddharth Kumar', eventColor: 'maroon' },
                    { id: 'Yunus Tonse', title: 'Yunus Tonse', eventColor: 'green' },
                    { id: 'Dr Sanket Seth', title: 'Dr Sanket Seth', eventColor: '#FF00FF' },
                    { id: 'Dr. Manoj DLima', title: 'Dr. Manoj DLima', eventColor: 'orange' },
                    { id: 'Dr Venugopal H', title: 'Dr Venugopal H', eventColor: 'red' },
                    { id: 'Dr Ajay Prabhu', title: 'Dr Ajay Prabhu', eventColor: 'lime' },
                    { id: 'Dr Pradeep Kharvi', title: 'Dr Pradeep Kharvi', eventColor: 'purple' },
                    { id: 'Dr Rajaram Shetty', title: 'Dr Rajaram Shetty', eventColor: '#9ACD32' },
                    { id: 'Dr Sudhir Rao', title: 'Dr Sudhir Rao', eventColor: 'maroon' },
                    { id: 'Dr Puneeth Hegde', title: 'Dr Puneeth Hegde', eventColor: 'black' },
                    { id: 'Dr Dilip Quadras', title: 'Dr Dilip Quadras', eventColor: '#FF00FF' },
                    { id: 'Dr Syed Mustafa Hasani', title: 'Dr Syed Mustafa Hasani', eventColor: '#0000FF' },
                    { id: 'Dr Gururaj Krishnamurthy', title: 'Dr Gururaj Krishnamurthy', eventColor: '#00FFFF' },
                    { id: 'Dr Shinaj Kumar', title: 'Dr Shinaj Kumar', eventColor: '#FFC0CB' },
                    { id: 'Dr Syed Faiz', title: 'Dr Syed Faiz', eventColor: '#BDB76B' },
                    { id: 'Name: Dr Shahinda Ismail', title: 'Name: Dr Shahinda Ismail', eventColor: '#00BFFF' },
                    { id: 'Dr Manav Kalra', title: 'Dr Manav Kalra', eventColor: '#9ACD32' },
                    { id: 'Dr Bennete Fernandes', title: 'Dr Bennete Fernandes', eventColor: '#FFFFE0' },
                    { id: 'Dr Nikhil Mahajan', title: 'Dr Nikhil Mahajan', eventColor: '#B8860B' },

                    { id: 'Dr Shilpa Gangwar', title: 'Dr Shilpa Gangwar', eventColor: 'maroon' },
                    { id: 'Dr Reshma Mehta', title: 'Dr Reshma Mehta', eventColor: 'green' },
                    { id: 'Dr Pradeep Vighne', title: 'Dr Pradeep Vighne', eventColor: '#FF00FF' },
                    { id: 'Dr Ayush Srivastava', title: 'Dr Ayush Srivastava', eventColor: 'orange' },
                    { id: 'Dr Richa Vajpeyee', title: 'Dr Richa Vajpeyee', eventColor: 'red' },
                    { id: 'Dr Amaey Parekh', title: 'Dr Amaey Parekh', eventColor: 'lime' },
                    { id: 'Dr Ankit Jha', title: 'Dr Ankit Jha', eventColor: 'purple' },
                    { id: 'Dr Akhilesh Kaushik', title: 'Dr Akhilesh Kaushik', eventColor: '#9ACD32' },
                    { id: 'Dr Ritu Gupta', title: 'Dr Ritu Gupta', eventColor: 'maroon' },
                    { id: 'Dr Henal Gandhi', title: 'Dr Henal Gandhi', eventColor: 'black' },
                    { id: 'Dr Seema Herle', title: 'Dr Seema Herle', eventColor: '#FF00FF' },
                    { id: 'Dr Namitha P. Kamath', title: 'Dr Namitha P. Kamath', eventColor: '#0000FF' },
                    { id: 'Dr Prashanth Ramachandra', title: 'Dr Prashanth Ramachandra', eventColor: '#00FFFF' },
                    { id: 'Dr Tanvi Patil', title: 'Dr Tanvi Patil', eventColor: '#FFC0CB' },
                    { id: 'Dr Sonali Das', title: 'Dr Sonali Das', eventColor: '#BDB76B' },
                    { id: 'Dr Samir Kumar Praharaj', title: 'Dr Samir Kumar Praharaj', eventColor: '#00BFFF' },
                    { id: 'Dr Raghavan Sreevatsan', title: 'Dr Raghavan Sreevatsan', eventColor: '#9ACD32' },
                    { id: 'Dr.Evit John', title: 'Dr.Evit John', eventColor: '#FFFFE0' },
                    { id: 'Rajamma Sister', title: 'Rajamma Sister', eventColor: '#B8860B' },

                    { id: 'Dr Sandeep Pai', title: 'Dr Sandeep Pai', eventColor: 'maroon' },
                    { id: 'Dr Akshay', title: 'Dr Akshay', eventColor: 'green' },
                    { id: 'Dr Ganesh Kamath', title: 'Dr Ganesh Kamath', eventColor: '#FF00FF' },
                    { id: 'Dr Sunil & Team', title: 'Dr Sunil & Team', eventColor: 'orange' },
                    { id: 'Dr. Rajesh', title: 'Dr. Rajesh', eventColor: 'red' },
                    { id: 'Dr Preeti', title: 'Dr Preeti', eventColor: 'lime' },
                    { id: 'Dr Avinash', title: 'Dr Avinash', eventColor: 'purple' },
                    { id: 'Dr. Ramesh S. Ve', title: 'Dr. Ramesh S. Ve', eventColor: '#9ACD32' },
                    { id: 'Dr Khushboo', title: 'Dr Khushboo', eventColor: 'maroon' },
                    { id: 'Dr. Vishwanath', title: 'Dr. Vishwanath', eventColor: 'black' },
                    { id: 'Dr. Radhika SOAHS', title: 'Dr. Radhika SOAHS', eventColor: '#FF00FF' },
                    { id: 'Dr Varsha', title: 'Dr Varsha', eventColor: '#0000FF' },
                    { id: 'Dr nagraj p g optom', title: 'Dr nagraj p g optom', eventColor: '#00FFFF' },
                    { id: 'Dr Pooja', title: 'Dr Pooja', eventColor: '#FFC0CB' },
                    { id: 'Dr Aishwarya S', title: 'Dr Aishwarya S', eventColor: '#BDB76B' },
                    { id: 'Dr Dr Aishwarya Shetty', title: 'Dr Aishwarya Shetty', eventColor: '#00BFFF' },
                    { id: 'Dr Apoorva', title: 'Dr Apoorva', eventColor: '#9ACD32' },
                    { id: 'Dr.Suresh Shenoy', title: 'Dr.Suresh Shenoy', eventColor: '#FFFFE0' },
                    { id: 'Dr.Priyanka Agarwal', title: 'Dr.Priyanka Agarwal', eventColor: '#B8860B' },

                    { id: 'Dr N Prakash', title: 'Dr N Prakash', eventColor: '#9ACD32' },
                    { id: 'Dr Mayank Sharma', title: 'Dr Mayank Sharma', eventColor: '#FFFFE0' },
                    { id: 'Dr.Shrey Dhawan', title: 'Dr.Shrey Dhawan', eventColor: '#B8860B' },
                ],

                eventRender: function (event, element) {

                    var view = $('#calendar').fullCalendar('getView');

                    if (view.name === 'verticalResourceView') {
                        element.find('.fc-title').empty();
                        element.find('.fc-title').append(event.description.split('\n')[0]);
                    }
                    else {
                        element.find('.fc-title').empty();

                        if (event.description === 'On Vacation') {
                            element.find('.fc-title').append('On Vacation - ' + event.title);
                        } else {
                            element.find('.fc-title').append(event.title);
                        }

                    }

                },
                eventClick: $scope.alertOnEventClick
            }
        };

        this.toggleview = function () {
            if ($scope.isCalendarView === true) {
                $scope.isCalendarView = false;
                $scope.isTableView = true;
            }
            else {
                $scope.isCalendarView = true;
                $scope.isTableView = false;
            }
        };

        /* alert on eventClick calendar*/
        $scope.alertOnEventClick = function (date, jsEvent, view) {
            $scope.currentEvent = date;
            $mdSidenav('right').toggle();
        };

        //================================================================================
        // Scope Functions
        //================================================================================

        $scope.getEvents = function () {
            $googleCalendar.getEvents().then(function (events, eventRender) {

                $scope.events = events;

                for (var index = 0; index < events.length; index++) {
                    var event = events[index];

                    $scope.calEvents[index] = {
                        'title': event.summary,
                        'start': event.start.dateTime,
                        'end': event.end.dateTime,
                        'description': event.description,
                        'resourceId': event.summary,
                        'stick': 'true',
                    };
                    console.log(event.summary);
                }

            });
        };

        $scope.eventSources = [$scope.calEvents];

        $scope.setCurrentEvent = function (event) {
            $scope.currentEvent = event;
        };

        $scope.myFilter = function (event) {
            return  event.description !== 'On Vacation';
        };


    }]);


'use strict';

angular.module('EventUtil', [])

.factory('broadcast', ['$rootScope', function($rootScope){
	return function(eventName, payload){
		$rootScope.$broadcast(eventName, payload);
	};
}])
.factory('listenTo', ['$rootScope', function($rootScope){
	return function(eventName, listener){
		$rootScope.$on(eventName, listener);
	};
}]);
'use strict';


angular.module('GoogleCalendarService', [], ["$provide", function ($provide) {

	$provide.factory('$googleCalendar', ["$http", "$q", "$location", function ($http, $q, $location) {

		var $scope = angular.element(document).scope();

		//the url where our node.js application is located
		var baseUrl = $location.protocol() + '://' + location.host;

		return {
			getEventByUser: function (user, startDate, endDate) {
				var defer = $q.defer();

				var jsonData = {
					params: {
						startdate: startDate,
						enddate: endDate,
						user: user.fName + ' ' + user.lName
					}
				};

				$http.get(baseUrl + '/api/getEventByUser', jsonData)
					.then(function (response) {

						if (response.status === 200) {
							$scope.$broadcast('GoogleEventsReceived', response.data.items);
							defer.resolve(response.data.items);
							console.log(response.data.items);
						}

						else {
							$scope.$broadcast('GoogleError', response.data);
							defer.reject(response.data);
						}

					});

				return defer.promise;
			},
			getEvents: function () {
				var defer = $q.defer();

				$http.get(baseUrl + '/api/events').then(function (response) {

					if (response.status === 200) {
						$scope.$broadcast('GoogleEventsReceived', response.data.items);
						defer.resolve(response.data.items);
						console.log(response.data.items);
					}

					else {
						$scope.$broadcast('GoogleError', response.data);
						defer.reject(response.data);
					}

				});

				return defer.promise;
			},
			addEvent: function (scheduledDate, endDate, contactInfo, patientInfo) {
				var defer = $q.defer();
				
				/*
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

                var contactInfo = {
                    doctorName: this.selectedDentist.fName + ' ' + this.selectedDentist.lName,
                    emailId: this.selectedDentist.emailId,
                    treatment: this.selectedTreatment.description
                };*/
				
				var postData = {
					startdate: scheduledDate,
					enddate: endDate,
					personal: contactInfo,
                    patient: patientInfo
				};

				$http.post(baseUrl + '/api/events', postData, { 'Content-Type': 'application/json' })
					.then(function (response) {

						if (response.status === 200) {
							$scope.$broadcast('eventAddedSuccess', response.data);
							defer.resolve(response.data);
						}
						else {
							console.log(response.data);
							$scope.$broadcast('GoogleError', response.data);
							defer.reject(response.data);
						}
					},
					function (response) {
						console.log(response.data);
						$scope.$broadcast('GoogleError', response.data);
						defer.reject(response.data);
					});

				return defer.promise;
			}
		};

	}]);

}]);
'use strict';

// Configuring the Patients module
angular.module('patients',['multipleSelect','mgcrea.ngStrap', 'ngMaterial', 'ui.bootstrap']).run(['Menus',
  function (Menus) {
    // Add the patients dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Patient Information',
      state: 'patients.main',
    });
  }
]);

'use strict';

// Setting up route
angular.module('patients').config(['$stateProvider',
  function ($stateProvider) {
    // Patients state routing
    $stateProvider
      .state('patients', {
        abstract: true,
        url: '/patients',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('patients.main', {
        url: '/main',
        templateUrl: 'modules/patients/views/list-patients.client.view.html'
      })
    //   .state('events.list', {
    //     templateUrl: 'modules/events/views/list-events.client.view.html'
    //   })
    //   .state('events.calendar', {
    //     templateUrl: 'modules/events/views/calendar-events.client.view.html'
    //   })
    //   .state('events.create', {
    //     url: '/createappointment',
    //     templateUrl: 'modules/events/views/create-events.client.view.html'
    //   });
  }
]);

'use strict';

var patientApp = angular.module('patients');

patientApp.controller('PatientsController', ['$scope', 'Patients', function ($scope, Patients) {

    var patients;

    Patients.query(function(result){
        $scope.patients = result;
        patients = $scope.patients;
        $scope.totalItems = $scope.patients.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
    });    


    $scope.$watch("currentPage", function () {
        setPagingData($scope.currentPage);
    });

    function setPagingData(page) {

        if (patients && patients.length > 0) {
            var pagedData = patients.slice(
                (page - 1) * $scope.itemsPerPage,
                page * $scope.itemsPerPage
            );

            $scope.patients = pagedData;
        }

    }

}]);

'use strict';

angular.module('patients')

    //Patients service used for communicating with the patients REST endpoints

    .factory('Patients', ['$resource',
        function($resource) {
            return $resource('api/patients/:patientId', {
                patientId: '@_id'
            }, {
                    update: {
                        method: 'PUT'
                    }
                });
        }
    ]);

'use strict';

// Configuring the Personals module
angular.module('personals',['multipleSelect','mgcrea.ngStrap', 'ngMaterial',]).run(['Menus',
  function (Menus) {
    // Add the personals dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'personals',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'personals', {
      title: 'CareGivers',
      state: 'personals.list'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'personals', {
      title: 'Treatment Types',
      state: 'personals.appttypelist'
    });
  }
]);

'use strict';

// Setting up route
angular.module('personals').config(['$stateProvider',
    function ($stateProvider) {
        // Personals state routing
        $stateProvider
            .state('personals',
                {
                    abstract: true,
                    url: '/personals',
                    template: '<ui-view/>',
                    data:
                    {
                        roles: ['user', 'admin']
                    }
                })

            .state('personals.list',
                {
                    url: '',
                    templateUrl: 'modules/personals/views/list-personals.client.view.html'
                })

            .state('personals.appttypelist',
                {
                    url: '/appointmenttypes',
                    templateUrl: 'modules/personals/views/list-appttypes.client.view.html'
                });
    }
]);

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

'use strict';

var personalsApp = angular.module('personals');

personalsApp.controller('ApptTypeController', ['$scope', 'ApptTypes',
    function($scope, ApptTypes) {

        $scope.procedureList = [];
        $scope.procedure = [];
        $scope.disabled = false;

        var refresh = function() {
            $scope.procedureList = ApptTypes.query();
            $scope.procedure = [];
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
            $scope.procedure = [];
            $scope.disabled = false;
        };

    }
]);
'use strict';

// Personals create controller

var personalsApp = angular.module('personals');

personalsApp.controller('PersonalsCreateController', ['$scope', 'Personals', 'Notify', '$timeout', '$window', 'Authentication', 'FileUploader',
    function ($scope, Personals, Notify, $timeout, $window, Authentication, FileUploader) {

        var personal = [];

        // Create new Personal
        this.CreatePrsnl = function () {

            // Create new Personal object
            personal = new Personals({
                fName: this.fName,
                lName: this.lName,
                emailId: this.emailId,
                contact: this.contact,
                isConsultant: this.isConsultant,
                regNumber: this.regNumber,
                speciality: this.speciality,
                qualification: this.qualification,
                experience: this.experience,
                rating: this.rating,
                treatments: this.selectedTreatments,
                slots: this.slots,
                profileImageURL: this.profileImageURL
            });

            // Redirect after save
            personal.$save(function (response) {

                // Clear form fields
                $scope.fName = '';
                $scope.lName = '';
                $scope.emailId = '';
                $scope.contact = '';
                $scope.isConsultant = '';
                $scope.regNumber = '';
                $scope.speciality = '';
                $scope.qualification = '';
                $scope.experience = '';
                $scope.rating = null;
                $scope.selectedTreatments = null;
                $scope.slots = null;
                $scope.profileImageURL = null;
                $scope.file = null;
                Notify.sendMsg('NewPersonal', { 'id': response._id });

            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // Clear messages
            $scope.success = $scope.error = null;

            // Start upload
            $scope.uploader.uploadAll();

        };

        // Create file uploader instance
        $scope.uploader = new FileUploader({
            url: '/api/personal/picture',
            alias: 'personalProfilePicture'
        });

        // Set file uploader image filter
        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function (item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // Called after the user selected a new picture file
        $scope.uploader.onAfterAddingFile = function (fileItem) {
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(fileItem._file);

                fileReader.onload = function (fileReaderEvent) {
                    $timeout(function () {
                        $scope.imageURL = fileReaderEvent.target.result;
                    }, 0);
                };
            }
        };

        // Called after the user has successfully uploaded a new picture
        $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            // Show success message
            $scope.success = true;

            // Populate user object
            personal.profileImageURL = response.profileImageURL;

             // Redirect after save
            personal.$save(function(response) {

                // Clear form fields
                personal = null;
                
                Notify.sendMsg('NewPersonal', { 'id': response._id });

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // Clear upload buttons
            $scope.cancelUpload();
        };

        // Called after the user has failed to uploaded a new picture
        $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
            // Clear upload buttons
            $scope.cancelUpload();

            // Show error message
            $scope.error = response.message;
        };

        // Cancel the upload process
        $scope.cancelUpload = function () {
            $scope.uploader.clearQueue();
            $scope.profileImageURL;
        };

    }
]);


'use strict';

// Personals update controller

var personalsApp = angular.module('personals');

personalsApp.controller('PersonalsUpdateController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
    function($scope, $timeout, $window, Authentication, FileUploader) {
        this.rating = 1;
        this.rateFunction = function(rating) {
            alert('Rating selected - ' + rating);
        };

        var personal = [];

        // Update existing Personal
        this.UpdatePrsnl = function(updtpersonal) {

            personal = updtpersonal;

             personal.$update(function() {
            }, function(errorResponse) {

                // $scope.error = errorResponse.data.message;
                // console.log(errorResponse.data.message);
            });

            // Clear messages
            $scope.success = $scope.error = null;

            // Start upload
            $scope.uploader.uploadAll();
        };

        

        // Create file uploader instance
        $scope.uploader = new FileUploader({
            url: '/api/personal/picture',
            alias: 'personalProfilePicture'
        });

        // Set file uploader image filter
        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function(item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // Called after the user selected a new picture file
        $scope.uploader.onAfterAddingFile = function(fileItem) {
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(fileItem._file);

                fileReader.onload = function(fileReaderEvent) {
                    $timeout(function() {
                        $scope.personal.profileImageURL = fileReaderEvent.target.result;
                    }, 0);
                };
            }
        };

        // Called after the user has successfully uploaded a new picture
        $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
            // Show success message
            $scope.success = true;

            // Populate user object
            personal.profileImageURL = response.profileImageURL;

            personal.$update(function() {
            }, function(errorResponse) {

                $scope.error = errorResponse.data.message;
                console.log(errorResponse.data.message);
            });

            // Clear upload buttons
            $scope.cancelUpload();
        };

        // Called after the user has failed to uploaded a new picture
        $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
            // Clear upload buttons
            $scope.cancelUpload();

            // Show error message
            $scope.error = response.message;
        };

        // Cancel the upload process
        $scope.cancelUpload = function() {
            $scope.uploader.clearQueue();
            $scope.profileImageURL;
        };


    }
]);
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
            DialogController.$inject = ["$scope", "$mdDialog", "personal", "$googleCalendar", "$mdToast"];

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
'use strict';

angular.module('personals')

    //Personals service used for communicating with the personals REST endpoints

    .factory('Personals', ['$resource',
        function($resource) {
            return $resource('api/personals/:personalId', {
                personalId: '@_id'
            }, {
                    update: {
                        method: 'PUT'
                    }
                });
        }
    ])

    .factory('ApptTypes', ['$resource',
        function($resource) {
            return $resource('api/appttypes/:appttypeId', {
                appttypeId: '@_id'
            }, {
                    update: {
                        method: 'PUT'
                    }
                });
        }
    ])

    .factory('Notify', ['$rootScope', function($rootScope) {
        var notify = {};

        notify.sendMsg = function(msg, data) {
            data = data || {};
            $rootScope.$emit(msg, data);

            console.log('message sent!');
        };

        notify.getMsg = function(msg, func, scope) {
            var unbind = $rootScope.$on(msg, func);

            if (scope) {
                scope.$on('destroy', unbind);
            }
        };
        return notify;
    }]);

'use strict';

// Configuring the Personals module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/views/admin/user-list.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/views/admin/user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/views/admin/user-edit.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function ($scope, $state, $http, $location, $window, Authentication) {
    $scope.authentication = Authentication;

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/events/main');
    }

    $scope.signup = function () {
      $http.post('/api/auth/signup', $scope.credentials).then(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response.data;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'events.main', $state.previous.params);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    $scope.signin = function () {
      $http.post('/api/auth/signin', $scope.credentials).then(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response.data;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'events.main', $state.previous.params);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      var redirect_to;

      if ($state.previous) {
        redirect_to = $state.previous.href;
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url + (redirect_to ? '?redirect_to=' + encodeURIComponent(redirect_to) : '');
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/users/password', $scope.passwordDetails).then(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
