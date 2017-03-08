'use strict';

// Configuring the Patients module
angular.module('patients',['multipleSelect','mgcrea.ngStrap', 'ngMaterial', 'ui.bootstrap']).run(['Menus',
  function (Menus) {
    // Add the patients dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Patient Info',
      state: 'patients.main',
    });
  }
]);
