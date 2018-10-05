-----------------------------START------------------------------<br>
Steps to run the app 
1. update all packages npm install (maybe not needed)
2. create a folder called data/ in app folder
3. open database: mongod --dbpath=data/
4. run server: npm start

Or:
Heroku link: https://network-journal.herokuapp.com

--------------------------SignUp/Login---------------------------<br>
1. Click on any button on the navbar to display the login page
2. Click the SignUp button to sign up
3. Sign up two users as you can add each other
4. Click on Login to Login with your EMAIL and PASSWORD
	- if you try to login with an unregistered user, an error message will show in red
	- if you try to login with the wrong password, an error message will show in red as well

--------------------------Search View------------------------------<br>
Features:<br>
The purpose of this tab is for users to search for restaurants to meet their contacts.
They can enter a search location in the right text box, and the type of food they want to eat in the
left text box. Once the search button is clicked a GET request will be made to the Yelp API, which will return a JSON object that contains various information on the restaurants that match our search terms. We then display some of this information on the left side of the screen, and the location of the restaurant will be passed to the Google Maps API and displayed on the map on the right side of the screen.
1. Enter food term in left tab
2. Enter location in right tab
3. Click search
4. Information on the restaurant will appear on the left
5. The location of the restaurant will appear on the map to the right

------------------------Profile View--------------------------------<br>
Features and how end-users might use it:<br>
On the left side of the screen is for displaying the meeting schedule of the current user. If the user did not add any meetings, nothing will be shown.
On the right side of the screen, there's a default profile picture at the top and the user's name and school are shownn under it.<br>
There are two buttons under the informations:
1. Edit Profile button: There will be a form shown below where user can enter his/her new name and new school. After submit button is clicked, the information above will be updated automatically and the database is updated as well.
    - Click Edit Profile
	- Enter New name and New school
	- Click Submit
2. Add Meeting button: There will be a form shown below where user can add a new meeting to his/her meeting schedule. Each meeting has three attribute, which are date, location and attendees. The user has to input all the information in order to successfully add a new meeting. Meeting added will be shown on the left side of the screen.
	- Click Add Meeting
	- Enter Date, Location and Attendees
	- Click Submit

----------------------------Contact View--------------------------------<br>
To Add a Contact:
1. input an email of your friend on the top lect corner and click add contact
	- if you try to add a contact that does not exists, alert message will pop up
    - if you try to add yourself, alert message will pop up
2. You should see the contact list refreshed
3. You can add a journal with this contact by clicking on "Add Journal Button"
4. You can view the journal you just added by clicking on the "Detail" Button
5. You can also delete a contact by cliking on the "delete" button
