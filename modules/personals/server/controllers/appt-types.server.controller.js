'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ApptType = mongoose.model('ApptType'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a apptType
 */
exports.create = function (req, res) {
  var apptType = new ApptType(req.body);
  apptType.user = req.user;

  apptType.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(apptType);
    }
  });
};

/**
 * Show the current apptType
 */
exports.read = function (req, res) {
  res.json(req.apptType);
};

/**
 * Update a apptType
 */
exports.update = function (req, res) {
  var apptType = req.apptType;

  apptType.description = req.body.description;
  apptType.duration = req.body.duration;
  apptType.price = req.body.price;
   apptType.longDescription = req.body.longDescription;

  apptType.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(apptType);
    }
  });
};

/**
 * Delete an ApptType
 */
exports.delete = function (req, res) {
  var apptType = req.apptType;
  
  apptType.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(apptType);
    }
  });
};

/**
 * List of ApptTypes
 */
exports.list = function (req, res) {
  ApptType.find().exec(function (err, apptTypes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(apptTypes);
    }
  });
};


/**
 * Appt Type middleware
 */
exports.apptTypeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ApptType is invalid'
    });
  }

  ApptType.findById(id).exec(function (err, apptType) {
    if (err) {
      return next(err);
    } else if (!apptType) {
      return res.status(404).send({
        message: 'No appttype with that identifier has been found'
      });
    }
    req.apptType = apptType;
    next();
  });
};