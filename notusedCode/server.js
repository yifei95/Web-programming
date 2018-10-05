const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const yelp = require("yelp-fusion");

const user = require('./app/routes/user-routes.js');

const YELP_API_KEY = "tH4gUCwN4P8nF4xZ77HIfRe9E8EBoV_Teu6P67dWiRjCpSdrI7nCNp-S9UEvEJMYwRLPmgX0Cb-Flh5_QBUYrOAUfNVEKrEEw6fghGS_V84aLTwqsEbpyxG67jdzWnYx";

const yelpClient = yelp.client(YELP_API_KEY);

const app = express();
const port = 3000;

// middleware to parse json
app.use(bodyParser.json());

// middleware for css styles/images/javascript
app.use(express.static(__dirname + "/app/views"));

const DB_NAME = "network-journal";
const MONGO_URL = "mongodb://localhost/" + DB_NAME;

// Connect to mongodb
mongoose.connect(MONGO_URL).then(
    () => {
        console.log('Mongoose: initial connection successful! Connected on ' + MONGO_URL);
    },
    err => {
        console.error('Mongoose:', err.message, '\nExiting now...');
        process.exit(-1);
    }   
);

// Render index.thml
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/app/views/index.html");
})

// 
app.get('/profile', function(req, res) {
    res.send("this is working");
    console.log("Success!!");
})

// Login
app.post('/login', user.findOne);

// Signup
app.post('/signup', (req, res) => {
    const {email, password, name, school, currentStatus, contacts, meetings} = req.body;
    database.users.push({
        id: "125",
        name: name,
        email: email,
        password: password,
        school: school,
        currentStatus: currentStatus,
        contacts: contacts,
        meetings: meetings
    });
    res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) =>{
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            return res.json(user);
        }
    })
    if(!found){
        res.status(400).json("not found");
    }
})

app.put('/contacts', (req, res) => {
    const { id, name } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            user.contacts.push(name)
            return res.json(user.contacts);
        }
    })
    if(!found){
        res.status(400).json("not found");
    }
})

app.get('/search', (req, res) => {
    const searchRequest = req.query;
    yelpClient.search(searchRequest).then(response => {
        const firstResult = response.jsonBody.businesses[0];
        const prettyJson = JSON.stringify(firstResult, null, 4);
        console.log(prettyJson);
        res.send(prettyJson);
    }).catch(e => {
        console.log(e);
    });
});

app.listen(port, () => {
    console.log("app is running on port 3000");
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