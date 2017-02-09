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
