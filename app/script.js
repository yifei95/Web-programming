const YELP_API_KEY = "tH4gUCwN4P8nF4xZ77HIfRe9E8EBoV_Teu6P67dWiRjCpSdrI7nCNp-S9UEvEJMYwRLPmgX0Cb-Flh5_QBUYrOAUfNVEKrEEw6fghGS_V84aLTwqsEbpyxG67jdzWnYx";
const YELP_API_URL = "https://api.yelp.com/v3/businesses/search";

// Event listeners
var location_to_search = document.getElementById("location_to_search");

// Navigation bar elements
var nav_home = document.getElementById("nav_home");
nav_home.addEventListener("click", loadHomeView);

var nav_search = document.getElementById("nav_search");
nav_search.addEventListener("click", loadSearchView);

var nav_contacts = document.getElementById("nav_contacts");
nav_contacts.addEventListener("click", loadContactView);

var nav_profile = document.getElementById("nav_profile");
nav_profile.addEventListener("click", loadProfileView);

var nav_login = document.getElementById("nav_login");
nav_login.addEventListener("click", loadLoginView);

// Global variables

// Handles map and marker in search view
var map;
var marker;

// Checks whether user is logged in
var isLoggedIn = false;

// Test variables used to test out logging in
var test_user = "test";
var test_pass = "test";

//store user name and sessions
var emailuserlogin = "";

// Calendar months
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var newName = "";
var newSchool = "";

// GET request to Yelp Fusion V3 API to return a list of restaurants
// based on the location entered in location_to_search.
function getRestaurantsList(){
	if(location_to_search.value === ""){
		window.alert("Please enter a location");
	} else {
		console.log(location_to_search.value);
		$.ajax({
			type:'GET',
			url: YELP_API_URL,
			datatype: 'json',
			data: {
				term: 'food',
				location: location_to_search.value
			},
			headers: {'authorization': 'Bearer ' + YELP_API_KEY},
			success:
				function(data){
	            // similar to enumerate in python
	            	console.log("received data");
	            // $.each(data,function(i,item){
	            //     $('<li>')
	            //     .text(item.name)
	            //     .appendTo('.location_list')
	            //     console.log(item.name)
	            // })
	        	}
		});
	}
}

// Loads the view for the Home page
function loadHomeView(){
	resetNavBarStyle();
	loadViewTitle();

	let div_box = $("<div></div>").attr({id: "home_page_slogans"});
	let div_first = $("<div></div>").attr({id: "home_view_first"});
	let text_first = $("<text></text>").text("Maintain Connections");
	div_first.append(text_first);

	let div_second = $("<div></div>").attr({id: "home_view_second"});
	let text_second = $("<text></text>").text("Schedule Meetings");
	div_second.append(text_second);

	let div_third = $("<div></div>").attr({id: "home_view_third"});
	let text_third = $("<text></text>").text("Build up your Network");
	div_third.append(text_third);

	div_box.append(div_first, div_second, div_third);
	$("#current_view").append(div_box);
}

// Loads the view for the Search page
function loadSearchView(){
	resetNavBarStyle();
	$('#nav_search').addClass("active");
	loadViewTitle();

	let header = $("<h2></h2>").text("Search by location");
    let form_box = $("<form></form>");
    let location_search = $("<input>").attr({id: "location_to_search", placeholder: "Enter location"});
    let food_type = $("<input>").attr({id: "food_type", placeholder: "Enter type of food"});
    let search_section = $("<section></section>").attr({class: "search_section_container"});

    let search_location_button = $("<button></button>").text("Search").attr({id: "search_location_button"});
    let search_result_div = $("<div></div>").attr({id: "search_result_div"});
    let search_result_image = $("<img></img>").attr({id: "search_res_img"});
    let search_result_name = $("<text></text>").attr({id: "res_name"});
    let search_result_type = $("<text></text>").attr({id: "res_type"});
    let search_result_addr = $("<text></text>").attr({id: "res_addr"});

    let map_div_box = $("<div></div>");
    let map_canvas_div = $("<div></div>").attr("id", "map-canvas");

    map_div_box.append(search_location_button, map_canvas_div);
    search_result_div.append(search_result_image, search_result_name, search_result_type, search_result_addr);
    search_section.append(search_result_div, map_div_box);
	$("#current_view").append(header, form_box, food_type, location_search, search_section);

	initMap();
}

// Loads the view for the Contacts page
function loadContactView(){
	if(isLoggedIn === false) {
		loadLoginView()
	} else {
		resetNavBarStyle();
		$('#nav_contacts').addClass("active");
		loadViewTitle();
    //load add contact button
		let contactButton = '<br><br><form class="form-inline">' +
    '<div class="form-group">' +
      '<input type="contact" class="form-control" id="contactEmail" placeholder="Search Contact Email" name="contact"></div>' +
    '<button type="button" id="addContactBtn" onclick="addNewContact()" class="btn btn-default">Add</button>' +
  '</form><br>'

		// Loads some filler contacts - will be replaced by backend data when implemented
		var list_container = $("<div></div>").attr({id: "list_container"});
		var dynamic_list = $("<ul></ul>").attr({id: "dynamic_list"});

		var profile_pic_src = "images/default_profile.png";

		$.ajax({
			url: "/getContacts",
			type: 'GET',
			cache: false,

			success: function(data, status) {
				if (status == "success") {
					var contactCollection = JSON.parse(data);
					// add the contacts to the page
					var contactEmails = Object.keys(contactCollection);
					contactEmails.sort();
					contactEmails.forEach(function(theEmail) {
						var contactObj = contactCollection[theEmail];
						var name = contactObj.name;
						var school = contactObj.school;
						var contactID = contactObj.contactID;
						var list_entry = createContact(profile_pic_src, name, school, contactID);
						dynamic_list.append(list_entry);
					});
					list_container.append(dynamic_list);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				alert(xhr.responseText);
				console.log('Error!  Status = ' + xhr.status);
			}
		});

    let detail_well = $("<div id='diary'></div>")

		$("#current_view").append(contactButton, list_container, detail_well);

	}
}

function addNewContact() {
	var contact = $("#contactEmail").val();
	$.ajax({
		url: "/addContact",
		type: 'POST',
		cache: false,
		contentType: 'application/json',
		data: JSON.stringify({
			contact: contact
		}),
		success: function(data, status) {
			alert(data);
			loadContactView();
		},
		error: function(xhr, textStatus, errorThrown) {
			alert(xhr.responseText);
			console.log('Error!  Status = ' + xhr.status);
		}
	});
}

// Creates html tags for a contact in the Contacts page
function createContact(profile_pic, userName, desc, contactID) {
	let message_pic = "images/message_icon.png";
	let calendar_pic = "images/calendar_icon.png";

	let list_entry = $("<li></li>").attr({class: "list_item"});
	let list_item_div = $("<div></div>").attr({class: "list_item_div"});
	let icons_div = $("<div></div>").attr({class: "icons_div"});
	let profile_icon = $("<img></img>").attr({src: profile_pic, class: "profile_icon"});
	let message_icon = $("<img></img>").attr({src: message_pic, class: "message_icon"});
	let calendar_icon = $("<img></img>").attr({src: calendar_pic, class: "calendar_icon"});
    let details_icon = $("<button class='btn btn-default' name='"+userName+"' onclick='clickdetail(this.id)'></button>").text("Details").attr({id: "details_" + contactID});
    let addLog_icon = $("<button class='btn btn-info' name='"+userName+"' onclick='addLog(this.id)'></button>").text("Add Meeting Journal").attr({id: "log_" + contactID});
		let deleteContact_icon = $("<button class='btn btn-danger' name='"+userName+"' onclick='deleteContact(this.id)'></button>").text("Delete Contact").attr({id: "delete_" + contactID});
	let contact_info_div = $("<div></div>").attr({class: "contact_info"});
	let name_div = $("<div></div>").text(userName).attr({class: "contact_name"});
	let desc_div = $("<div></div>").text(desc).attr({class: "contact_desc"});

	contact_info_div.append(name_div, desc_div)
	icons_div.append(details_icon, addLog_icon, deleteContact_icon);
	list_item_div.append(icons_div, contact_info_div);
	list_entry.append(list_item_div);

	return list_entry;
}

function deleteContact(myID){

		var contactID = myID.replace("delete_", "");
		$.ajax({
			url: "/deleteContact" + $.param({"contactID": contactID}),
			type: 'DELETE',
			cache: false,
			contentType: 'application/json',
			success: function(data, status) {
				alert(data);
				loadContactView();
			},
			error: function(xhr, textStatus, errorThrown) {
				alert(xhr.responseText);
				console.log('Error!  Status = ' + xhr.status);
			}
    });
}

function addLog(myID){
	var contactID = myID.replace("log_", "");
	var obj = document.getElementById(myID);
	var name = obj.name;
	let title = "Add Meeting Journal with " + name;
	document.getElementById("diary").innerHTML = '<h2>' + title +'</h2>';
	let form =   '<div class="container"> <form> '+
	'<label for="date">Date:</label>'+
	'<input type="date" id="journalDate" name="date" required="">'+
	'<div class="form-group">'+
	'<label for="summary">Meeting Summary:</label>'+
	'<textarea class="form-control" rows="5" id="summary" name="summary" placeholder="What did you guys talked about?" required=""></textarea>'+
	'</div><div class="form-group"><label for="next">Topics Next Time:</label>'+
	'<textarea class="form-control" rows="2" id="topicsNextTime" name="topicsNextTime" placeholder="What are some suggested topics for next time?" required=""></textarea>'+
	'</div><button type="button" class="btn btn-default" id=' + contactID + ' onclick="addJournal(this.id)">Submit</button></form></div>'

	document.getElementById("diary").innerHTML = '<h2>' + title +'</h2>' + form;
}

function journal_log(summary, nextTopic, date){
	let i = $("<div></div>").attr({class: "container right"});
	let content = $("<div></div>").attr({class: "content"});
	let time = $("<h3></h3>").text(date);
	let titlesummary = $("<h4></h4>").text("Summary of This Meeting");
	let talked = $("<p></p>").text(summary);
	let titleNext = $("<h4></h4>").text("Suggested Topic Next Time");
	let nextT = $("<p></p>").text(nextTopic);
	content.append(time, titlesummary, talked, titleNext, nextT);
	i.append(content);

	return i;

}

function clickdetail(myID){
		var contactID = myID.replace("details_", "");
		var obj = document.getElementById(myID);
		var name = obj.name;
	    let title = "Journal with " + name;
	    document.getElementById("diary").innerHTML = '<h2>' + title +'</h2>';

		let journal  = $("<div></div>").attr({class: "diary_body"});
		let timeline = $("<div></div>").attr({class: "timeline"});

		var data = {};
		data.contact = contactID;

		$.ajax({
			url: "/getJournals",
			type: 'POST',
			cache: false,
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(data, status) {
				if (status == "success") {
					var journalCollection = {}
					try {
						var journalCollection = JSON.parse(data);
					} catch (e) {
						alert(data);
						return;
					}
					var journalIDs = Object.keys(journalCollection);
					journalIDs.sort();
					journalIDs.forEach(function(theJournalID) {
						var journalObj = journalCollection[theJournalID];
						var journalDate = journalObj.journalDate.replace("T00:00:00.000Z", "");
						var meetingSummary = journalObj.meetingSummary;
						var topicsNextTime = journalObj.topicsNextTime;
						var j = journal_log(meetingSummary, topicsNextTime, journalDate);
						timeline.append(j);
					});
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				alert(xhr.responseText);
				console.log('Error!  Status = ' + xhr.status);
			}
		});
    journal.append(timeline);

		$("#diary").append(journal);

}

function clickEditProfile() {
    let form = '<div class="container"> <form> '+
    '<label>New name:</label>'+
    '<textarea class="form-control" rows="1" id="edit_name"></textarea>'+
    '</div><div>'+
    '<label>New School:<label>' +
    '<textarea class="form-control" rows="1" id="edit_school"></textarea>'+
    '</div><div>'+
    '</div><button type="button" class="btn btn-default" onclick="editProfile()">Submit</button></form></div>'

    document.getElementById("add_meetings_div").innerHTML = form;
}

function editProfile(){
    let new_name = document.getElementById("edit_name").value;
    let new_school = document.getElementById("edit_school").value;

    data = {};

    data.new_name = new_name;
    data.new_school = new_school;

    $.ajax({
        url: '/editProfile',
        type: 'PUT',
        cache: false,
        contentType: 'application/json',
        data: JSON.stringify(data),
        // data: data,
        success: function( data, status ){
            // Dummy values used to verify username and password
            console.log("edit profile success!");
            newName = new_name;
            newSchool = new_school;
            loadProfileView();
         },
        error: function(xhr, textStatus, errorThrown) {
             alert(xhr.responseText);
             alert("edit profile error response!")
             alert('Error!  Status = ' + xhr.status);
        }
    });

}

// Loads the view for the Profile page
function loadProfileView(){
    console.log("Loading profile view");
    if(isLoggedIn === false) {
        console.log("Not logged in");
        loadLoginView()
    } else {
        resetNavBarStyle();
        $('#nav_profile').addClass("active");
        loadViewTitle();

        // Loads some filler profile information - will be replaced by backend data when implemented

        // Filler profile for test user
        let profile_whole_view = $("<div></div>").attr({id: "profile_whole_view"});
        let left_view = $("<div></div>").attr({id: "left_view"});
        let profile_view = $("<div></div>").attr({id: "profile_view"});
        let profile_div = $("<div></div>").attr({id: "profile_div"});
        let profile_img_div = $("<div></div>").attr({id: "profile_img_div"});
        let profile_img = $("<img>").attr({id: "profile_img", src: "images/default_profile.png"});
        let profile_info = $("<div></div>").attr({id: "profile_info"});
        let edit_profile_button = $("<button></button>").attr({id: "edit_profile_button", onClick: "clickEditProfile()"}).text("Edit Profile");
        let edit_profile_div = $("<div></div>").attr({id: "edit_profile_div"});
        //let profile_name = $("<div></div>").attr({id: "profile_name"}).text("Test test");
        //let profile_desc = $("<div></div>").attr({id: "profile_desc"}).text("U of T student");

        // console.log("making ajax call in load profile view");
        // $.ajax({
        //     url: "/getProfile",
        //     type: 'GET',
        //     cache: false,

        //     success: function(data, status) {

        //         console.log("Success making get profile request");
        //         var userObj = data;
        //         var userName = userObj.name
        //         var userSchool = userObj.school
        //         var nameInfo = createProfileImg(userName)
        //         var schoolInfo = createProfileImg(userSchool)
        //         profile_info.append(nameInfo, schoolInfo);

        //     },
        //     error: function(xhr, textStatus, errorThrown) {
        //         alert(xhr.responseText);
        //         console.log('Error!  Status = ' + xhr.status);
        //     }
        // });


        // Filler meetings for test user

        let meetings_icon = $("<button class='btn btn-default' name='"+name+"' onclick='clickAddMeeting()'></button>").text("Add Meeting").attr({id: "meetings_button"});

        let add_meetings_div = $("<div></div>").attr({id: "add_meetings_div"});
        //right view

        let right_view = $("<div></div>").attr({id: "right_view"});
        let meetings_div = $("<div></div>").attr({id: "meetings_div"});

        let title = '<h2>' + "Meetings" +'</h2>';
        let timeline = $("<div></div>").attr({class: "timeline"});

        console.log("Making ajax request for get meetings");
        $.ajax({
            url: "/getMeetings",
            type: 'GET',
            cache: false,
            success: function(data, status) {
                console.log("/getmeetings success");
                var meetingCollection = {}
                try {
                    var meetingCollection = JSON.parse(data);
                } catch (e) {
                    alert(data);
                    return;
                }
                //get user info and save
                var user = meetingCollection.userInfo;
                delete meetingCollection.userInfo
                var userName = user.name;
                var userSchool = user.school;

                // var nameInfo = createProfileImg(userName);
                // var schoolInfo = createProfileImg(userSchool);
                var nameInfo = $("<div></div>").attr({id: "profile_name"}).text(userName);
                var schoolInfo = $("<div></div>").attr({id: "profile_school"}).text(userSchool);

                console.log(newName);
                console.log(newSchool);
                if (newName !="" && newSchool !=""){
                    var nameInfo = $("<div></div>").attr({id: "profile_name"}).text(newName);
                    var schoolInfo = $("<div></div>").attr({id: "profile_school"}).text(newSchool);
                }
                profile_info.append(nameInfo, schoolInfo);
                var meetingIDs = Object.keys(meetingCollection);
                meetingIDs.sort();
                meetingIDs.forEach(function(theMeetingID) {
                    var meetingObj = meetingCollection[theMeetingID];
                    var meetingDate = meetingObj.meetingDate.replace("T00:00:00.000Z", "");
                    var meetingLocation = meetingObj.location;
                    var meetingAttendee = meetingObj.attendees;
                    var m = meeting_log(meetingDate, meetingLocation, meetingAttendee);
                    timeline.append(m);
                });
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("Error in get meetings ajax in load profile view");
                alert(xhr.responseText);
                console.log('Error!  Status = ' + xhr.status);
            }
        });

        profile_img_div.append(profile_img);
        profile_div.append(profile_img_div, profile_info, edit_profile_button, edit_profile_div, meetings_icon);
        profile_view.append(profile_div);

        //first = meeting_log("2017 July 3rd", "40 st. George St", "Nate");
        //second = meeting_log("2017 August 23rd", "45 Willcocks St", "Nate, Bob");
         //timeline.append(first, second)

        meetings_div.append(timeline);

        // left_view.append(profile_view, meetings_icon, add_meetings_div);
        left_view.append(profile_view, add_meetings_div);


        right_view.append(title, meetings_div)

        profile_whole_view.append(left_view, right_view)

        $("#current_view").append(profile_whole_view);
    }
}

function createProfileImg(info){

    let information = $("<div></div>").text(info);

    return information
}

function clickAddMeeting(){
    let form = '<div class="container"> <form> '+
    '<label for="date">Date:</label>'+
    '<input type="date" id="meetingDate" name="meetingDate">'+
    '<div class="form-group">'+
    '<label for="location">Location:</label>'+
    '<textarea class="form-control" rows="1" id="meetingLocation" name="summary"></textarea>'+
    '</div><div class="form-group"><label for="attendees">Attendees:</label>'+
    '<textarea class="form-control" rows="1" id="meetingAttendee" name="topicsNextTime"></textarea>'+
    '</div><button type="button" class="btn btn-default" onclick="addMeeting()">Submit</button></form></div>'

    document.getElementById("add_meetings_div").innerHTML = form;
}

function meeting_log(date, location, attendee){
    let i = $("<div></div>").attr({class: "container right"});
    let content = $("<div></div>").attr({class: "content"});
    let time = $("<h4></h4>").text(date);
    let address = $("<p></p>").text("location: " + location);
    let names = $("<p></p>").text("Attendees: " + attendee);
    content.append(time, address, names);
    i.append(content);

    return i;

}

function addMeeting(){
     var data = {}

     data.date_of_meeting = $('#meetingDate').val();
     data.location = $('#meetingLocation').val();
     data.attendee = $('#meetingAttendee').val();

     $.ajax({
            url: '/addMeeting',
            type: 'POST',
            cache: false,
            contentType: 'application/json',
            data: JSON.stringify(data),
            // data: data,
            success: function( data, status ){
                alert(data);
                    loadProfileView();


             },
            error: function(xhr, textStatus, errorThrown) {
                 alert(xhr.responseText);
                 alert("add meeting error response!")
                 alert('Error!  Status = ' + xhr.status);
            }
     });
 }

// Loads the view for the Login page
function loadLoginView(){
	resetNavBarStyle();
	loadViewTitle();
	let div_box = $("<div></div>").attr({id: "div_login_box"});

	// Div for username
	let div_user = $("<div></div>").attr({id: "div_user"}).text("Username");
	let username = $("<input>").attr({id: "username", autofocus: "autofocus"});
	div_user.append(username);

	// Div for password
	let div_pass = $("<div></div>").attr({id: "div_password"}).text("Password");
	let password = $("<input>").attr({id: "password", type: "password"});
	div_pass.append(password);

	// Div for incorrect password
	let div_error = $("<div></div>").attr({id: "div_error"});

	// Div for login and sign-up buttons
	let div_buttons = $("<div></div>").attr({id: "div_buttons"});
	let login_button = $("<button></button>").attr({id: "login_button"}).text("Login");
	let signup_button = $("<button></button>").attr({id: "signup_button"}).text("Sign Up");
	login_button.click(login);
	signup_button.click(loadSignUp);

	div_buttons.append(login_button, signup_button);

	div_box.append(div_user, div_pass, div_error, div_buttons);
	$("#current_view").append(div_box);
}

// Verifies username and password for logging in.
// (Currently using dummy values because backend hasn't been implemented)
function login(){
	var username = document.getElementById("username").value;
	var pwd = document.getElementById("password").value;
  var data = {email: username, password: pwd};
	$.ajax({
             url: '/login',
             type: 'POST',
						 cache: false,
						 contentType: 'application/json',
             data: JSON.stringify(data),
             success: function( data, status ){
							 // Dummy values used to verify username and password
							 	alert(status);
							    isLoggedIn = true;
								emailuserlogin = username;
								nav_login.innerHTML = "Welcome " + username;
								nav_login.removeEventListener("click", loadLoginView);
								let logout = '<a class="nav-link js-scroll-trigger" href="/LogOut" id="nav_logout"><font size=4.5>LogOut</font></a>'
								$('#logoutButton').append(logout);

								// Stops nav_login from being highlighted on hover
								$('#nav_login').css('background-color', '#696969');
								loadHomeView();
                console.log(data);
             },
    		 		 error: function(xhr, textStatus, errorThrown) {
							  $("#div_error").text(xhr.responseText);
      					console.log('Error!  Status = ' + xhr.status);
    				 }
         });



}

// Dynamically loads the header of the current view
function loadViewTitle(){
	marker = undefined;
	$("#current_view").remove();
	let new_box = $("<div></div>").attr("id", "current_view");
	$("#background").append(new_box);
}

// Resets color highlighting on nav bar
function resetNavBarStyle(){
	$('#nav_profile').removeClass("active");
	$('#nav_login').removeClass("active");
	$('#nav_search').removeClass("active");
	$('#nav_contacts').removeClass("active");
}

// Initializes Map in Search view
function initMap() {

	// Centers map at Toronto
	var mapOptions = {
	    center: { lat: 43.6532, lng: -79.3832 },
	    zoom: 8
	};
	var geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	document.getElementById('search_location_button').addEventListener('click', function() {
          searchLocation(geocoder, map);
        });
}

// Searches for address based on location entered in search bar
function searchLocation(geocoder, resultsMap) {

    let address = document.getElementById('location_to_search').value;
    let term = document.getElementById('food_type').value;
    if(address === ""){
		window.alert("Please enter a location");
	} else {
        if(term == ""){
            term = "food";
        }
        $.ajax({
            url: '/search',
            type: 'GET',
            data: {
                term: term,
                location: address
            },
            success: function(data, status) {
                var data = JSON.parse(data);
                console.log(data);
                name = data['name'];
                image = data['image_url'];
                address = data['location']['address1'];

                console.log(name);
                console.log(image);
                console.log(address);

                document.getElementById("res_name").innerHTML = name;
                document.getElementById("res_addr").innerHTML = address;
                document.getElementById("search_res_img").src = image;

                geocoder.geocode({'address': address}, function(results, status) {
                    if (status === 'OK') {
                        resultsMap.setCenter(results[0].geometry.location);
                        if(marker === undefined){
                            // console.log("marker undefined, creating marker");
                            marker = new google.maps.Marker({
                                map: resultsMap,
                                position: results[0].geometry.location
                            });
                          } else {
                              // console.log("setting positon");
                                marker.setPosition(results[0].geometry.location);
                          }
                    } else {
                          alert('Geocode was not successful for the following reason: ' + status);
                      }
                  });
            }
        });
  	}
}

 function loadSignUp(){
    page = 		'<div class="container"> <h2>Sign Up Today!</h2><form class="form-horizontal" action="/signup" method="POST">'+
				    '<div class="form-group">  <label class="control-label col-sm-2" for="email">Email:</label> ' +
				     ' <div class="col-sm-10"> <input type="email" class="form-control" id="email" placeholder="Enter email" name="email"> </div>' +
				    '</div>  <div class="form-group"><label class="control-label col-sm-2" for="password">Password:</label>' +
				     ' <div class="col-sm-10"> <input type="password" class="form-control" id="password" placeholder="Enter password" name="password"></div>  </div>' +
						'<div class="form-group"><label class="control-label col-sm-2" for="name">Name:</label><div class="col-sm-10">' +
								'<input type="name" class="form-control" id="name" placeholder="Enter Name" name="name"></div></div>' +
						'<div class="form-group"><label class="control-label col-sm-2" for="school">School/Work:</label><div class="col-sm-10">' +
							'	<input type="school" class="form-control" id="school" placeholder="Enter school/work" name="school">' +
							'</div></div><div class="form-group">' +
	    '  <label class="control-label col-sm-2" for="currentStatus">Current Status:</label>' +
			'<div class="col-sm-10">' +
	     ' <select class="form-control" id="currentStatus" name="currentStatus"> <option value="1">In School</option> <option value="2">Working</option> <option value="3">Looking for a Job</option> <option value="4">Looking for a Better Position</option></select>' +
				'</div></div><div class="form-group"> <div class="col-sm-offset-2 col-sm-10">' +
				        '<button type="submit" class="btn btn-default">Submit</button>' +
				      '</div></div></form></div>'
							resetNavBarStyle();
							loadViewTitle();
			$("#current_view").append(page);

 }

 function addJournal(contactID){
	 var data = {}

	 data.date = $('#journalDate').val();
	 data.summary = $('#summary').val();
	 data.nextTopic = $('#topicsNextTime').val();
	 data.contactID = contactID;

	 $.ajax({
							 url: '/addJournal',
							 type: 'POST',
							cache: false,
							contentType: 'application/json',
							 data: JSON.stringify(data),
							 success: function( data, status ){
								// Dummy values used to verify username and password
								 alert("Data: " + data + "\nStatus: " + status);

							 },
							error: function(xhr, textStatus, errorThrown) {
								 alert(xhr.responseText);
								 console.log('Error!  Status = ' + xhr.status);
							}
					 });
 }
