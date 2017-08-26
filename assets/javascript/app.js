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

// Button for adding a new train
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
    dest: trainDestination,
    startTime: trainStartTime,
    freq: trainFrequency
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
  var m = moment(childSnapshot.val().startTime, "HH:mm");
  var minutesAway = childSnapshot.val().frequency - moment().diff(m, 'minutes') % childSnapshot.val().frequency;
  var nextArrival = moment().add(minutesAway, 'minute').format('hh:mm A');

  // Appends the full list of employees to the #employees panel to HTML
  $("#employees").append("<tr><td> " + childSnapshot.val().name +
    " </td><td> " + childSnapshot.val().destination +
    " </td><td> " + childSnapshot.val().frequency +
    " </td><td> " + nextArrival +
    " </td><td> " + minutesAway + " </td></tr>");

// Handle the errors
},  function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
});