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
