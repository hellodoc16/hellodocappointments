'use strict';

(function () {
  // Personals Controller Spec
  describe('Personals Controller Tests', function () {
    // Initialize global variables
    var PersonalsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Personals,
      mockPersonal;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Personals_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Personals = _Personals_;

      // create mock personal
      mockPersonal = new Personals({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Personal about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Personals controller.
      PersonalsController = $controller('PersonalsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one personal object fetched from XHR', inject(function (Personals) {
      // Create a sample personals array that includes the new personal
      var samplePersonals = [mockPersonal];

      // Set GET response
      $httpBackend.expectGET('api/personals').respond(samplePersonals);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.personals).toEqualData(samplePersonals);
    }));

    it('$scope.findOne() should create an array with one personal object fetched from XHR using a personalId URL parameter', inject(function (Personals) {
      // Set the URL parameter
      $stateParams.personalId = mockPersonal._id;

      // Set GET response
      $httpBackend.expectGET(/api\/personals\/([0-9a-fA-F]{24})$/).respond(mockPersonal);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.personal).toEqualData(mockPersonal);
    }));

    describe('$scope.craete()', function () {
      var samplePersonalPostData;

      beforeEach(function () {
        // Create a sample personal object
        samplePersonalPostData = new Personals({
          title: 'An Personal about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Personal about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Personals) {
        // Set POST response
        $httpBackend.expectPOST('api/personals', samplePersonalPostData).respond(mockPersonal);

        // Run controller functionality
        scope.create();
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the personal was created
        expect($location.path.calls.mostRecent().args[0]).toBe('personals/' + mockPersonal._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/personals', samplePersonalPostData).respond(400, {
          message: errorMessage
        });

        scope.create();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock personal in scope
        scope.personal = mockPersonal;
      });

      it('should update a valid personal', inject(function (Personals) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/personals\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update();
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/personals/' + mockPersonal._id);
      }));

      it('should set scope.error to error response message', inject(function (Personals) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/personals\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(personal)', function () {
      beforeEach(function () {
        // Create new personals array and include the personal
        scope.personals = [mockPersonal, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/personals\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockPersonal);
      });

      it('should send a DELETE request with a valid personalId and remove the personal from the scope', inject(function (Personals) {
        expect(scope.personals.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.personal = mockPersonal;

        $httpBackend.expectDELETE(/api\/personals\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to personals', function () {
        expect($location.path).toHaveBeenCalledWith('personals');
      });
    });
  });
}());
