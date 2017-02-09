'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Personal = mongoose.model('Personal'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, personal;

/**
 * Personal routes tests
 */
describe('Personal CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new personal
    user.save(function () {
      personal = {
        title: 'Personal Title',
        content: 'Personal Content'
      };

      done();
    });
  });

  it('should be able to save an personal if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new personal
        agent.post('/api/personals')
          .send(personal)
          .expect(200)
          .end(function (personalSaveErr, personalSaveRes) {
            // Handle personal save error
            if (personalSaveErr) {
              return done(personalSaveErr);
            }

            // Get a list of personals
            agent.get('/api/personals')
              .end(function (personalsGetErr, personalsGetRes) {
                // Handle personal save error
                if (personalsGetErr) {
                  return done(personalsGetErr);
                }

                // Get personals list
                var personals = personalsGetRes.body;

                // Set assertions
                (personals[0].user._id).should.equal(userId);
                (personals[0].title).should.match('Personal Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an personal if not logged in', function (done) {
    agent.post('/api/personals')
      .send(personal)
      .expect(403)
      .end(function (personalSaveErr, personalSaveRes) {
        // Call the assertion callback
        done(personalSaveErr);
      });
  });

  it('should not be able to save an personal if no title is provided', function (done) {
    // Invalidate title field
    personal.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new personal
        agent.post('/api/personals')
          .send(personal)
          .expect(400)
          .end(function (personalSaveErr, personalSaveRes) {
            // Set message assertion
            (personalSaveRes.body.message).should.match('Title cannot be blank');

            // Handle personal save error
            done(personalSaveErr);
          });
      });
  });

  it('should be able to update an personal if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new personal
        agent.post('/api/personals')
          .send(personal)
          .expect(200)
          .end(function (personalSaveErr, personalSaveRes) {
            // Handle personal save error
            if (personalSaveErr) {
              return done(personalSaveErr);
            }

            // Update personal title
            personal.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing personal
            agent.put('/api/personals/' + personalSaveRes.body._id)
              .send(personal)
              .expect(200)
              .end(function (personalUpdateErr, personalUpdateRes) {
                // Handle personal update error
                if (personalUpdateErr) {
                  return done(personalUpdateErr);
                }

                // Set assertions
                (personalUpdateRes.body._id).should.equal(personalSaveRes.body._id);
                (personalUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of personals if not signed in', function (done) {
    // Create new personal model instance
    var personalObj = new Personal(personal);

    // Save the personal
    personalObj.save(function () {
      // Request personals
      request(app).get('/api/personals')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single personal if not signed in', function (done) {
    // Create new personal model instance
    var personalObj = new Personal(personal);

    // Save the personal
    personalObj.save(function () {
      request(app).get('/api/personals/' + personalObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', personal.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single personal with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/personals/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Personal is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single personal which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent personal
    request(app).get('/api/personals/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No personal with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an personal if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new personal
        agent.post('/api/personals')
          .send(personal)
          .expect(200)
          .end(function (personalSaveErr, personalSaveRes) {
            // Handle personal save error
            if (personalSaveErr) {
              return done(personalSaveErr);
            }

            // Delete an existing personal
            agent.delete('/api/personals/' + personalSaveRes.body._id)
              .send(personal)
              .expect(200)
              .end(function (personalDeleteErr, personalDeleteRes) {
                // Handle personal error error
                if (personalDeleteErr) {
                  return done(personalDeleteErr);
                }

                // Set assertions
                (personalDeleteRes.body._id).should.equal(personalSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an personal if not signed in', function (done) {
    // Set personal user
    personal.user = user;

    // Create new personal model instance
    var personalObj = new Personal(personal);

    // Save the personal
    personalObj.save(function () {
      // Try deleting personal
      request(app).delete('/api/personals/' + personalObj._id)
        .expect(403)
        .end(function (personalDeleteErr, personalDeleteRes) {
          // Set message assertion
          (personalDeleteRes.body.message).should.match('User is not authorized');

          // Handle personal error error
          done(personalDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Personal.remove().exec(done);
    });
  });
});
