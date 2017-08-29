// Initialize Firebase
var config = {
  apiKey: "AIzaSyDVwbOY21VzBknW1_6kkBd1V9gtFIAlwUA",
  authDomain: "train-scheduler-80e63.firebaseapp.com",
  databaseURL: "https://train-scheduler-80e63.firebaseio.com",
  projectId: "train-scheduler-80e63",
  storageBucket: "train-scheduler-80e63.appspot.com",
  messagingSenderId: "523977115893"
};
firebase.initializeApp(config);

var dataRef = firebase.database();

firebase.auth().onAuthStateChanged(function(user){
  console.log(user);
  if(user){
// Event handler when clicking button to add a new train
$("#add-train").on("click", function(event) {
  // prevent form from submitting
  event.preventDefault();

  // Grab values from form input boxes
  var trainName = $("#name-input").val().trim();
  var trainDestination = $("#dest-input").val().trim();
  var trainStartTime = $("#time-input").val().trim();
  var trainFrequency = $("#freq-input").val().trim();

  // Local object for holding train data
  var newTrain = {
    name: trainName,
    destination: trainDestination,
    startTime: trainStartTime,
    frequency: trainFrequency
  }

  // Push train object to database
  dataRef.ref().push(newTrain);

  // Clear form input boxes
  $("#name-input").val("");
  $("#dest-input").val("");
  $("#time-input").val("");
  $("#freq-input").val("");
 });

// Firebase watcher + initial loader when a train is added
dataRef.ref().on("child_added", function(childSnapshot) {
  
  // Calculate how long until next train and the time of arrival based on start time and frequency
  var minutesAway = calcMinAway(moment(childSnapshot.val().startTime, "HH:mm"), childSnapshot.val().frequency);
  var nextArrival = moment().add(minutesAway, 'minute');

  // Appends the full list of trains to the table panel in HTML
  $("#employees > tbody").append("<tr id="+childSnapshot.key+"><td contenteditable> " + childSnapshot.val().name +
    " </td><td contenteditable> " + childSnapshot.val().destination +
    " </td><td contenteditable> " + childSnapshot.val().frequency +
    " </td><td> " + nextArrival.format('hh:mm A') +
    " </td><td> " + minutesAway + " </td><td> " +
    " <button type='sumbit' class='btn btn-primary btn-sm edit' value=" + childSnapshot.key +
    " ><span class='glyphicon glyphicon-ok' aria-hidden='true'></span></button> " +
    " <button type='sumbit' class='btn btn-primary btn-sm delete' value=" + childSnapshot.key +
    " ><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td></tr>");

  // Handle any errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Remove train when user clicks delete button
$(document).on("click", ".delete", function(){
  var key = $(this).val();
  // Delete row from HTML
  $("#"+key).remove();
  // Remove values from database
  dataRef.ref(key).remove()
})

// Update train details whenever a user clicks the edit button
$(document).on("click", ".edit", function(){
  var key = $(this).val();

  // Retrieve values from table cells
  trainName = $("#"+key).find("td:nth-child(1)").text();
  trainDestination = $("#"+key).find("td:nth-child(2)").text();
  trainFrequency = $("#"+key).find("td:nth-child(3)").text();

  // Update database with new values
  dataRef.ref(key).update({
    name: trainName,
    destination: trainDestination,
    frequency: trainFrequency
  });
});

// Firebase watcher triggered when a train frequency is changed
dataRef.ref().on("child_changed", function(childSnapshot, prevChildKey) {

  // Calculate how long until next train and the time of arrival based on start time and frequency
  var minutesAway = calcMinAway(moment(childSnapshot.val().startTime, "HH:mm"), childSnapshot.val().frequency);
  var nextArrival = moment().add(minutesAway, 'minute');

  // update time for next arrival
  $("#"+childSnapshot.key).find("td:nth-child(4)").text(nextArrival.format('hh:mm A'));
  // update time for minutes away
  $("#"+childSnapshot.key).find("td:nth-child(5)").text(minutesAway);

    // Handle any errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Function takes in the first starting train time and it's frequency
// Returns the number of minutes until the next train arrives
function calcMinAway(firstTrainTime, frequency) {
  var totalMinutesAway = firstTrainTime.diff(moment(), 'minute');
  
  // Waiting for the first train to arrive
  if (totalMinutesAway > 0) {
    return totalMinutesAway + 1;
  }
  // Train is here right now
  else if (totalMinutesAway == 0) {
    return totalMinutesAway;
  }
  // Waiting for the next train to come
  else {
    return frequency - Math.abs(totalMinutesAway) % frequency;
  }
}
}}

//** Authentication **\\

// Github Authentication
var providerGithub = new firebase.auth.GithubAuthProvider();

function githubSignin() {
  firebase.auth().signInWithPopup(providerGithub).then(function(result) {
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;

    // hide all sign-in buttons and show sign-out button
    // $("#github-login").attr("style", "display:none");
    // $("#google-login").attr("style", "display:none");
    // $("#github-logout").removeAttr("style");

    console.log(token)
    console.log(user)
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;

    console.log(error.code)
    console.log(error.message)
  });
}

function githubSignout(){
   firebase.auth().signOut()
   
   .then(function() {
      // hide sign-out button and show sign-in buttons
      // $("#github-logout").attr("style", "display:none");
      // $("#github-login").removeAttr("style");
      // $("#google-login").removeAttr("style");

      console.log('Signout successful!')
   }, function(error) {
      console.log('Signout failed')
   });
}


// Google Authentication
var providerGoogle = new firebase.auth.GoogleAuthProvider();

function googleSignin() {
   firebase.auth().signInWithPopup(providerGoogle).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
    
      // hide all sign-in buttons and show sign-out button
      // $("#google-login").attr("style", "display:none");
      // $("#github-login").attr("style", "display:none");
      // $("#google-logout").removeAttr("style");

      console.log(token)
      console.log(user)
   }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;  
      console.log(error.code)
      console.log(error.message)
   });
}

function googleSignout() {
   firebase.auth().signOut()
  
   .then(function() {
      // hide sign-out button and show sign-in buttons
      // $("#google-logout").attr("style", "display:none");
      // $("#google-login").removeAttr("style");
      // $("#github-login").removeAttr("style");
      console.log('Signout Succesfull')
   }, function(error) {
      console.log('Signout Failed')  
   });
}