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
                    { id: 'Dr. Rajendra Kurady', title: 'Dr Rajendra Kurady', eventColor: 'maroon' },
                    { id: 'Dr. Saphal Shetty', title: 'Dr. Saphal Shetty', eventColor: 'green' },
                    { id: 'Dr. Satish K', title: 'Dr. Satish K', eventColor: '#FF00FF' },
                    { id: 'Dr. Siddharth K', title: 'Dr. Siddharth K', eventColor: 'orange' },
                    { id: 'Prof. Dr. Shiva Shankar', title: 'Prof. Dr. Shiva Shankar', eventColor: 'red' },
                    { id: 'Prof. Dr. Ponnanna A A', title: 'Prof. Dr. Ponnanna A A', eventColor: 'lime' },
                    { id: 'Prof. Dr. Anjan Shah', title: 'Prof. Dr. Anjan Shah', eventColor: 'purple' },
                    { id: 'Dr. Sudarshan Pujari', title: 'Dr. Sudarshan Pujari', eventColor: '#9ACD32' },
                    { id: 'Dr. Sudarshan A', title: 'Dr. Sudarshan A', eventColor: 'maroon' },
                    { id: 'Dr. Manjunath Hegde', title: 'Dr. Manjunath Hegde', eventColor: 'black' },
                    { id: 'Dr. Pallavi Urs', title: 'Dr. Pallavi Urs', eventColor: '#FF00FF' },
                    { id: 'Dr. Veena Aralli', title: 'Dr. Veena Aralli', eventColor: '#0000FF' },
                    { id: 'Prof. Dr. Dharma M Hinduja', title: 'Prof. Dr. Dharma M Hinduja', eventColor: '#00FFFF' },
                    { id: 'Prof. Dr. Nanda Kishor', title: 'Prof. Dr. Nanda Kishor', eventColor: '#FFC0CB' },
                    { id: 'Prof. Dr. Sunil Rao', title: 'Prof. Dr. Sunil Rao', eventColor: '#BDB76B' },
                    { id: 'Dr. Aparna Srinivas', title: 'Dr. Aparna Srinivas', eventColor: '#00BFFF' },
                    { id: 'Dr. Harish Sampath', title: 'Dr. Harish Sampath', eventColor: '#9ACD32' },
                    { id: 'Dr. Ranjitha Shetty', title: 'Dr. Ranjitha Shetty', eventColor: '#FFFFE0' },
                    { id: 'Dr. Syed Mutheei Ulla', title: 'Dr. Syed Mutheei Ulla', eventColor: '#B8860B' },
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

