'use strict';

var _ = require('underscore');
var gcal = require('google-calendar');
var User = require('mongoose').model('User');
var path = require('path');
var q = require('q');
var oauth = require('oauth');
var config = require(path.resolve('./config/config'));
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// // Load the twilio module
// var twilio = require('twilio');

// // Create a new REST API client to make authenticated requests against the twilio back end
// var client = new twilio.RestClient('AC1a0432d220e8240cae1acf4b39ff04b4', '28ad85cfa30f29acb55e21fd179db977');

// function sendSms(contactNumber) {

//     // Pass in parameters to the REST API using an object literal notation. The
//     // REST client will handle authentication and response serialzation for you.
//     client.sms.messages.create({
//         to: '+91' + contactNumber,   // This is my original number
//         from: '+17865286119', //I got this number from twilio
//         body: ' Your Appointment is Confirmed  Thank You'
//     }, function (error, message) {
//         // The HTTP request to Twilio will run asynchronously. This callback
//         // function will be called when a response is received from Twilio
//         // The "error" variable will contain error information, if any.
//         // If the request was successful, this value will be "falsy"
//         if (!error) {
//             // The second argument to the callback will contain the information
//             // sent back by Twilio for the request. In this case, it is the
//             // information about the text messsage you just sent:
//             console.log('Success! The SID for this SMS message is:');
//             console.log(message.sid);

//             console.log('Message sent on:');
//             console.log(message.dateCreated);
//         } else {
//             console.log('Oops! There was an error.');
//         }
//     });
// }

//

var plivo = require('plivo');
var p = plivo.RestAPI({ authId: 'MAY2NKNMU5MMEYZMQ4YW', authToken: 'MjQ5NTI0NzBlYThlNmRjNjhiYTlhOWFkY2VkNTdl' });

function sendSms(contactNumber) {
    var params = {
        'src': '+919845293868', // Sender's phone number with country code
        'dst': '+91' + contactNumber, //+919972095929', // Receiver's phone Number with country code
        'text': 'Hi,  Your Appointment is Confirmed  Thank You', // Your SMS Text Message - English
        //'text' :  // Your SMS Text Message - Japanese
        //'text' : // Your SMS Text Message - French
        'url': 'https://intense-brook-8241.herokuapp.com/report/', // The URL to which with the status of the message is sent
        'method': 'GET' // The method used to call the url
    };

    // Prints the complete response
    p.send_message(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
        console.log('Message UUID:\n', response['message.uuid']);
        console.log('Api ID:\n', response['api.id']);
    });
}


function authorize(refreshToken) {
    var deferred = q.defer();

    var oa = new oauth.OAuth2(config.google.clientID,
        config.google.clientSecret,
        'https://accounts.google.com/o',
        '/oauth2/auth',
        '/oauth2/token');

    if (refreshToken) {
        oa.getOAuthAccessToken(refreshToken, { grant_type: 'refresh_token', client_id: config.google.clientID, client_secret: config.google.clientSecret },
            function (err, access_token, refresh_token, res) {

                //lookup settings from database
                User.findOne({ username: 'confidenthospital' }, function (findError, settings) {
                    if (res !== undefined) {
                        var expiresIn = parseInt(res.expires_in);
                        var accessTokenExpiration = new Date().getTime() + (expiresIn * 1000);

                        //add refresh token if it is returned
                        if (refresh_token !== undefined) settings.providerData.refreshToken = refresh_token;

                        //update access token in database
                        settings.providerData.accessToken = access_token;
                        settings.google_access_token_expiration = accessTokenExpiration;

                        settings.save();

                        deferred.resolve(settings);
                    }

                });
            });

    }
    else {
        deferred.reject({ error: 'Application needs authorization.' });
    }

    return deferred.promise;
}

function getAccessToken() {
    var deferred = q.defer();
    var accessToken;


    User.findOne({ username: 'confidenthospital' }, function (findError, settings) {
        //check if access token is still valid
        var today = new Date();
        var currentTime = today.getTime();

        if (settings) {
            if (currentTime < settings.google_access_token_expiration) {
                deferred.resolve(settings);
            }
            else {
                //refresh the access token
                authorize(settings.providerData.refreshToken).then(function (settings) {

                    deferred.resolve(settings);

                }, function (error) {

                    deferred.reject(error);

                });
            }
        }

    });

    return deferred.promise;
}

exports.getEventByUser = function (req, res, next) {

    getAccessToken().then(function (user) {

        var accessToken = user.providerData.accessToken;
        var calendarId = user.email;
        var calendar = new gcal.GoogleCalendar(accessToken);

        var startDate = new Date(req.query.startdate).toISOString();
        var endDate = new Date(req.query.enddate).toISOString();

        calendar.events.list(calendarId, {
            'timeMin': startDate,
            'timeMax': endDate,
            'q': req.query.user,
            'singleEvents': true,
            orderBy: 'startTime'
        },
            function (err, eventList) {

                if (err) {
                    return res.status(400).send({
                        message: err
                    });
                } else {

                    res.send(JSON.stringify(eventList, null, '\t'));
                }

            });

    });

};

exports.list = function (req, res, next) {

    getAccessToken().then(function (user) {

        var accessToken = user.providerData.accessToken;
        var calendarId = user.email;
        var calendar = new gcal.GoogleCalendar(accessToken);

        calendar.events.list(calendarId, { 'timeMin': new Date().toISOString(), 'singleEvents': true }, function (err, eventList) {

            if (err) {
                return res.status(400).send({
                    message: err
                });
            } else {
                res.send(JSON.stringify(eventList, null, '\t'));
            }

        });

    });

};

exports.create = function (req, res, next) {
    //map request body to google calendar data structure

    getAccessToken().then(function (user) {


        var profile = user._doc;

        var eventBody = [];

        if (req.body.patient === null) {
            eventBody = {
                'status': 'confirmed',
                'summary': req.body.personal.fName + ' ' + req.body.personal.lName,
                'description': 'On Vacation',
                'organizer': {
                    'email': profile.email,
                    'self': true
                },
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {
                            'method': 'email',
                            'minutes': '40320'
                        },
                        {
                            'method': 'popup',
                            'minutes': '40320'
                        }
                    ]
                },
                'start': {
                    'dateTime': req.body.startdate,
                },
                'end': {
                    'dateTime': req.body.enddate
                },
                'attendees': [
                    {
                        'email': req.body.personal.emailId,
                        'organizer': true,
                        'self': true
                    }
                ]
            };
        }
        else {

            var description = '';
            if (req.body.patient.patientName) {
                description += ' Name: ' + req.body.patient.patientName;
            }
            if (req.body.patient.patientAge) {
                description += '\n Age: ' + req.body.patient.patientAge;
            }
            if (req.body.patient.patientGender) {
                description += '\n Gender: ' + req.body.patient.patientGender;
            }
            if (req.body.patient.patientPlace) {
                description += '\n Place: ' + req.body.patient.patientPlace;
            }
            if (req.body.patient.contact) {
                description += '\n Contact: ' + req.body.patient.contact;
            }
            if (req.body.patient.emailId) {
                description += '\n Email Id: ' + req.body.patient.emailId;
            }
            if (req.body.patient.patientSelectedMedicalCondition.length) {
                description += '\n Medical Condition: ' + req.body.patient.patientSelectedMedicalCondition;
            }
            if (req.body.patient.patientChiefComplaint) {
                description += '\n Chief Complaint: ' + req.body.patient.patientChiefComplaint;
            }
             if (req.body.personal.treatment) {
                description += '\n Treatment: ' + req.body.personal.treatment;
            }

            if (req.body.patient.emailId) {
                eventBody = {
                    'status': 'confirmed',
                    'summary': req.body.personal.doctorName,
                    'description': description,
                    'organizer': {
                        'email': profile.email,
                        'self': true
                    },
                    'reminders': {
                        'useDefault': false,
                        'overrides': [
                            {
                                'method': 'email',
                                'minutes': '40320'
                            },
                            {
                                'method': 'popup',
                                'minutes': '40320'
                            }
                        ]
                    },
                    'start': {
                        'dateTime': req.body.startdate,
                    },
                    'end': {
                        'dateTime': req.body.enddate
                    },
                    'guestsCanModify': true,
                    'attendees': [
                        {
                            'email': req.body.personal.emailId,
                            'organizer': true,
                            'self': true,
                            'responseStatus': 'needsAction'
                        },
                        {
                            'email': req.body.patient.emailId,
                            'organizer': false,
                            'responseStatus': 'needsAction'
                        }
                    ]
                };
            }
            else {
                eventBody = {
                    'status': 'confirmed',
                    'summary': req.body.personal.doctorName,
                    'description': description,
                    'organizer': {
                        'email': profile.email,
                        'self': true
                    },
                    'reminders': {
                        'useDefault': false,
                        'overrides': [
                            {
                                'method': 'email',
                                'minutes': '40320'
                            },
                            {
                                'method': 'popup',
                                'minutes': '40320'
                            }
                        ]
                    },
                    'start': {
                        'dateTime': req.body.startdate,
                    },
                    'end': {
                        'dateTime': req.body.enddate
                    },
                    'attendees': [
                        {
                            'email': req.body.personal.emailId,
                            'organizer': true,
                            'self': true,
                            'responseStatus': 'needsAction'
                        }
                    ]
                };
            }

        }


        var calendar = new gcal.GoogleCalendar(profile.providerData.accessToken);

        calendar.events.insert(profile.email, eventBody, function (err, response) {

            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.send(response);
                if (req.body.patient) {
                    sendSms(req.body.patient.contact);
                }

            }

        });
    });


};



