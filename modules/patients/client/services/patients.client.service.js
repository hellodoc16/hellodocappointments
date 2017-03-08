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
