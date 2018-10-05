"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var userSchema = new Schema({
  userID: {
    type: String, unique: true
  },
  name: {
    type: String, default: ""
  },
  email: {
    type: String, unique: true
  },
  password: {
    type: String
  },
  school: {
    type: String, default: ""
  },
  currentStatus: {
    type: Number
  },
  contacts: {
    type: [String], default: []
  },
  meetings: {
    type: [String], default: []
  }
}, {
  collection: "users"
});


var contactSchema = new Schema({
  contactID: {
    type: String, unique: true
  },
  email: {
    type: String
  },
  journalIDs: {
    type: [String], default: []
  }
}, {
  collection: "contacts"
});


var journalSchema = new Schema({
  journalID: {
    type: String, unique: true
  },
  journalDate: {
    type: Date
  },
  meetingSummary: {
    type: String
  },
  topicsNextTime: {
    type: String
  }
}, {
  collection: "journals"
});


var meetingSchema = new Schema({
  meetingID: {
    type: String, unique: true
  },
  meetingDate: {
    type: Date
  },
  location: {
    type: String
  },
  attendees: {
    type: String
  }
}, {
  collection: "meetings"
});


var schema = {
  'User': mongoose.model('User', userSchema),
  'Contact': mongoose.model('Contact', contactSchema),
  'Journal': mongoose.model('Journal', journalSchema),
  'Meeting': mongoose.model('Meeting', meetingSchema)
};

mongoose.connect("mongodb://heroku_1rks96zn:sfkr4vdbt0osvbgo5hf9jamma5@ds023523.mlab.com:23523/heroku_1rks96zn");
//mongoose.connect('mongodb://localhost/njdb');

module.exports = schema;
