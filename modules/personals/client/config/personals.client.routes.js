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
