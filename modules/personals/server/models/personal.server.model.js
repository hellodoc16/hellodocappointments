//database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ApptTypeSchema = require('./appt-type.server.model');

var PersonalSchema = new Schema({
    created: {
    type: Date,
    default: Date.now
    },
    fName: {
        type: String,
        default: '',
        required: 'Please fill your first name',
        trim: true
    },
    lName: {
        type: String,
        default: '',
        required: 'Please fill your last name',
        trim: true
    },
    emailId: {
        type: String,
        default: '',
        required: 'Please fill your email id',
        trim: true
    },
    contact: {
        type: String,
        default: '',
        required: 'Please fill your contact number',
        trim: true
    },
    isConsultant: {
        type: Boolean
    },
     regNumber: {
        type: String,
        default: '',
        trim: true
    },
    speciality: {
        type: String,
        default: '',
        trim: true
    },
    qualification: {
        type: String,
        default: '',
        trim: true
    },
      experience: {
        type: String,
        default: '',
        trim: true
    },
     rating: {
        type: Number,
        default: 0,
        trim: true
    },
     profileImageURL: {
        type: Schema.Types.Mixed,
        default: './modules/personals/img/profile/default.png'
    },
    
    treatments: [ApptTypeSchema],
    
    slots: [{
        day: {
            type: String,
            default: '',
            required: 'Please fill the day',
            trim: true
        } ,
        starttime: {
            type: Date
        },
        endtime: {
            type: Date
        },
        location: {
            type: String
        }
    }],
    
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Personal', PersonalSchema);
