'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    multer = require('multer'),
    config = require(path.resolve('./config/config')),
    Personal = mongoose.model('Personal');
/**
 * Create a personal
 */
exports.create = function(req, res) {
    var personal = new Personal(req.body);
    personal.user = req.user;

    personal.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(personal);
        }
    });
};

/**
 * Show the current personal
 */
exports.read = function(req, res) {
    res.json(req.personal);
};

/**
 * Update a personal
 */
exports.update = function(req, res) {
    var personal = req.personal;

    personal.fName = req.body.fName;
    personal.lName = req.body.lName;
    personal.contact = req.body.contact;
    personal.emailId = req.body.emailId;
    personal.regNumber = req.body.regNumber;
    personal.speciality = req.body.speciality;
    personal.isConsultant = req.body.isConsultant;
    personal.qualification = req.body.qualification;
    personal.experience = req.body.experience;
    personal.rating = req.body.rating;
    personal.treatments = req.body.treatments;
    personal.slots = req.body.slots;
    personal.profileImageURL = req.body.profileImageURL;

    personal.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(personal);
        }
    });
};

/**
 * Delete an personal
 */
exports.delete = function(req, res) {
    var personal = req.personal;

    personal.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(personal);
        }
    });
};

/**
 * List of Personals
 */
exports.list = function(req, res) {
    Personal.find().sort('-created').populate('user', 'displayName').exec(function(err, personals) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(personals);
        }
    });
};

/**
 * Personal middleware
 */
exports.personalByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Personal is invalid'
        });
    }

    Personal.findById(id).populate('user', 'displayName').exec(function(err, personal) {
        if (err) {
            return next(err);
        } else if (!personal) {
            return res.status(404).send({
                message: 'No personal with that identifier has been found'
            });
        }
        req.personal = personal;
        next();
    });
};

/**
 * Update profile picture
 */
exports.createPersonalPicture = function(req, res) {
    var message = null;
    var upload = multer(config.uploadPersonal.profileUpload).single('personalProfilePicture');
    var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;

    if (req.user) {
        var personal = new Personal();
        upload(req, res, function(uploadError) {
            if (uploadError) {
                personal.profileImageURL = './modules/personals/img/profile/default.png';
                res.json(personal);
            } else {
                personal.profileImageURL = './modules/personals/img/profile/uploads/' + req.file.filename;
                res.json(personal);
            }
        });
    }
};
