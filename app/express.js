const express = require("express");
const bodyParser = require("body-parser");
var session = require('client-sessions');
const yelp = require("yelp-fusion");
var path    = require("path");
var async = require("async");

const YELP_API_KEY = "tH4gUCwN4P8nF4xZ77HIfRe9E8EBoV_Teu6P67dWiRjCpSdrI7nCNp-S9UEvEJMYwRLPmgX0Cb-Flh5_QBUYrOAUfNVEKrEEw6fghGS_V84aLTwqsEbpyxG67jdzWnYx";

const app = express();
const yelpClient = yelp.client(YELP_API_KEY);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(path.join(__dirname)));


var db = require('./data.js');

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.get('/', function(req, res) {
    console.log("Success!!");
    //return res.send("success!!!");
    return res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', function(req, res) {
    if (!req.body.email || !req.body.password || !req.body.name
      || !req.body.school || !req.body.currentStatus) {
          console.log("user post error!");
          return res.redirect('/');
    }
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var school = req.body.school;
    var currentStatus = parseInt(req.body.currentStatus);

    var user = db.User({
      email: email,
      name: name,
      password: password,
      school: school,
      currentStatus: currentStatus
    });
    user.userID = user._id;
    user.save(function(err, data) {
      if (err) {
        return res.send(err.toString());
      }
      console.log("register new user success!!!")
      return res.redirect('/')
    });
});

app.get('/getContacts', function(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  var contactCollection = {};
  // get all the contact from this user
  db.User.findOne({
    userID: req.session.user.userID
  }, function(err, theUser) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theUser) {
      return res.send("session storage user is wrong");
    }
    myContacts = theUser.contacts;
    async.each(myContacts, function(theContactID, callback) {
      db.Contact.findOne({
        contactID: theContactID
      }, function(err, theContact) {
        if (err) {
          return res.send(err.toString());
        }
        if (!theContact) {
          return res.send("contact doesn't exist");
        }
        var contactEmail = theContact.email;
        db.User.findOne({
          email: contactEmail
        }, function(err, contactUser) {
          if (err) {
            return res.send(err.toString());
          }
          contactCollection[contactUser.email] = {};
          var contactObj = {};
          contactObj.name = contactUser.name;
          contactObj.school = contactUser.school;
          contactObj.contactID = theContactID;
          contactCollection[contactUser.email] = contactObj;
          callback(null);
        });
      });
    }, function(err) {
      if (err) {
        return res.send(err.toString());
      }
      return res.send(JSON.stringify(contactCollection));
    });
  });
});

app.post('/login', function(req, res) {
  console.log(req.body);
  var  User = db.User;
  console.log("come here");

  User.findOne({ email: req.body.email }, function(err, user) {
   if (!user) {
     console.log("user not find!");
     return res.status(500).send('user not find!')
   } else {
     if (req.body.password === user.password) {
       // sets a cookie with the user's info
       req.session.user = user;
       console.log("User:" + req.body.email + " login successfull")
       return res.send('success');
     } else {
       console.log("incorrect!");
       return res.status(500).send('Invalid email or password.');
     }
   }
 });

});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("app is running on port 3000");
});


app.post('/addContact', function(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  if (!req.body.contact) {
    console.log("contact is not given");
    return res.send('fail');
  }

  var contactEmail = req.body.contact;
  // find the contact email
  db.User.findOne({
    email: contactEmail
  }, function(err, theUser) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theUser) {
      return res.send("the contact email is not found!");
    }
    // check if the contact email is the current user email
    db.User.findOne({
      userID: req.session.user.userID
    }, function(err, myUser) {
      if (err) {
        return res.send(err.toString());
      }
      if (!myUser) {
        return res.send("session stored user is wrong!");
      }
      var myEmail = myUser.email;
      if (myEmail == contactEmail) {
        return res.send("cannot add my email to my contact!");
      }
      var myContacts = myUser.contacts;
      async.each(myContacts, function(theContactID, callback) {
        db.Contact.findOne({
          contactID: theContactID
        }, function(err, theContact) {
          if (err) {
            return res.send(err.toString());
          }
          if (!theContact) {
            return res.send("contact ID storage is wrong!");
          }
          if (theContact.email == contactEmail) {
            return res.send("the contact email has been added!");
          }
          callback(null);
        });
      }, function(err) {
        if (err) {
          return res.send(err.toString());
        }
        // create a new contact for the contactEmail
        var newContact = db.Contact({
          email: contactEmail,
          journalIDs: []
        });
        newContact.contactID = newContact._id;
        newContact.save(function(err, data) {
          if (err) {
            return res.send(err.toString());
          }
          console.log("new contact is created!");
          // add the newContact to the user
          myUser.contacts.push(newContact.contactID);
          myUser.save(function(err, data) {
            if (err) {
              return res.send(err.toString());
            }
            console.log("the new contact is saved to the user!");

            return res.send("success");
          });
        });
      });
    });
  });
});

app.post('/addJournal', function(req, res){
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  if (!req.body.date || !req.body.summary || !req.body.nextTopic || !req.body.contactID) {
    console.log('post information not enough');
    return res.send('please input again');
  }
  var journalDate = req.body.date;
  var summary = req.body.summary;
  var nextTopic = req.body.nextTopic;
  var contactID = req.body.contactID;

  // find the contact
  db.Contact.findOne({
    contactID: contactID
  }, function(err, theContact) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theContact) {
      return res.send("the contact is not found");
    }
    // create a new journal
    var journal = db.Journal({
      journalDate: journalDate,
      meetingSummary: summary,
      topicsNextTime: nextTopic
    });
    journal.journalID = journal._id;
    journal.save(function(err, newJournal) {
      if (err) {
        return res.send(err.toString());
      }
      // add the journal to the contact
      theContact.journalIDs.push(newJournal.journalID);
      theContact.save(function(err, data) {
        if (err) {
          return res.send(err.toString());
        }
        console.log("Return from /add journal");
        return res.send("success");
      });
    });
  });
});

app.delete('/deleteContact:contactID', function(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  console.log("deleting Contact with id " + req.params.contactID);

  let contactID = req.params.contactID.replace("contactID=", "");

  db.Contact.findOne({
    contactID: contactID
  }, function(err, theContact) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theContact) {
      return res.send("the contact doesn't exist");
    }
    theContact.remove(function(err, data) {
      if (err) {
        return res.send(err.toString());
      }
      console.log("delete successfully!");
      let userID = req.session.user.userID;
      db.User.findOne({
        userID: userID
      }, function(err, theUser) {
        if (err) {
          return res.send(err.toString());
        }
        if (!theUser) {
          return res.send("the user doesn't exist");
        }
        let contacts = theUser.contacts;
        let idx = contacts.indexOf(contactID);
        contacts.splice(idx, 1);
        theUser.contacts = contacts;
        theUser.save(function(err, data) {
          if (err) {
            return res.send(err.toString());
          }
          return res.send("success");
        });
      });
    });
  });

});

app.post('/getJournals', function(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  console.log(req.body);
  if (!req.body.contact) {
    return res.send("contactID is not posted");
  }
  var contactID = req.body.contact;
  // find all the journals with the contactID
  var journalCollection = {};
  db.Contact.findOne({
    contactID: contactID
  }, function(err, theContact) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theContact) {
      return res.send("contact is not found");
    }
    var journalIDs = theContact.journalIDs;
    async.each(journalIDs, function(theJournalID, callback) {
      db.Journal.findOne({
        journalID: theJournalID
      }, function(err, theJournal) {
        if (err) {
          return res.send(err.toString());
        }
        if (!theJournal) {
          return res.send("journal stored is wrong");
        }
        var journalObj = {};
        var journalID = theJournal.journalID;
        journalObj.journalDate = theJournal.journalDate;
        journalObj.meetingSummary = theJournal.meetingSummary;
        journalObj.topicsNextTime = theJournal.topicsNextTime;
        journalCollection[journalID] = journalObj;
        callback(null);
      });
    }, function(err) {
      if (err) {
        return res.send(err.toString());
      }
      return res.send(JSON.stringify(journalCollection));
    });
  });
});


app.post('/addMeeting', function(req, res) {
    console.log("in /addmeeting");
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  if (!req.body.date_of_meeting || !req.body.location || !req.body.attendee) {
    console.log("Not enough information");
    return res.send('Please input again');
  }
  var meetingDate = req.body.date_of_meeting;
  var location = req.body.location;
  var attendee = req.body.attendee;

  db.User.findOne({
      userID: req.session.user.userID
    }, function(err, myUser) {
    if (err) {
      return res.send(err.toString());
    }
    if (!myUser) {
        return res.send("session stored user is wrong!");
    }
    console.log("Found User");
      //create a new meeting
      var meeting = db.Meeting({
          meetingDate: meetingDate,
          location: location,
          attendees: attendee,
      });
      //var meetings = myUser.meetings;

      meeting.meetingID = meeting._id;
      meeting.save(function(err, data) {
          if (err) {
            console.log("Error with saving");
            return res.send(err.toString());
          }

          // add the meeting to the user
          myUser.meetings.push(meeting.meetingID);
          console.log(data);
          myUser.save(function(err, data) {
            if (err) {
                console.log("could not save meeting in user")
               return res.send(err.toString());
            }
            console.log("Returning from /addmeeting");
            return res.send("success");
          });
        });
     });
});

app.get('/getMeetings', function(req, res) {
  console.log("Making /getmeetings call");
  if (!req.session.user) {
    req.session.destroy();
    console.log("redirecting?");
    return res.redirect('/');
  }
  var meetingCollection = {};
  // get all the meetings from this user
  db.User.findOne({
    userID: req.session.user.userID
  }, function(err, theUser) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theUser) {
      return res.send("session storage user is wrong");
    }
    //add user info into data
    userObj = {}
    userObj.name = theUser.name;
    userObj.school = theUser.school;
    meetingCollection.userInfo = userObj

    var meetingIDs = theUser.meetings;
    async.each(meetingIDs, function(theMeetingID, callback) {
      db.Meeting.findOne({
        meetingID: theMeetingID
      }, function(err, theMeeting) {
        if (err) {
          return res.send(err.toString());
        }
        if (!theMeeting) {
          return res.send("meeting stored is wrong");
        }
        var meetingObj = {};
        var meetingID = theMeeting.meetingID;
        meetingObj.meetingDate = theMeeting.meetingDate;
        meetingObj.location = theMeeting.location;
        meetingObj.attendees = theMeeting.attendees;
        meetingCollection[meetingID] = meetingObj;
        callback(null);
      });
    }, function(err) {
      if (err) {
        return res.send(err.toString());
      }
      console.log("Returning from /getmeetings");
      return res.send(JSON.stringify(meetingCollection));
    });
  });
});

app.put('/editProfile', function(req, res) {
    if (!req.session.user) {
        req.session.destroy();
        return res.redirect('/');
    }
    ///
    console.log(req.session);
    console.log(req.session.user.userID);
    console.log(req.body.new_name);
    console.log(req.body.new_school);
    db.User.findOneAndUpdate(req.session.user.userID, {$set: {name: req.body.new_name, school: req.body.new_school}}, 
        function(err) {
            if (err) {
                return res.send(err.toString());
            }   
        }
    );
    console.log(req.session);
    return res.send("Success!");
});

app.get('/getProfile', function(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/');
  }
  var meetingCollection = {};
  // get all the meetings from this user
  db.User.findOne({
    userID: req.session.user.userID
  }, function(err, theUser) {
    if (err) {
      return res.send(err.toString());
    }
    if (!theUser) {
      return res.send("session storage user is wrong");
    }
    var userObj = {};
    userObj.name = theUser.name;
    userObj.school = theUser.school;
    userObj.meeting = theUser.meetings;
    return res.send(userObj);
  });
});


app.get('/search', (req, res) => {
  const searchRequest = req.query;
  yelpClient.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(prettyJson);
    res.send(prettyJson);
  }).catch(e => {
    console.log(e);
  })
})
/*
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/profile/name --> PUT = user
/profile/desc --> PUT = user
/contact --> POST = contact
/contact/details --> PUT = contact


*/
