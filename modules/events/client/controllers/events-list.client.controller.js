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

