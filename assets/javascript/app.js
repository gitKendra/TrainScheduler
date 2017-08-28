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
console.log("minutes until next train: "+ minutesAway);
console.log("next train: " + nextArrival.format('hh:mm A'));

  // Appends the full list of trains to the table panel in HTML
  $("#employees > tbody").append("<tr id="+childSnapshot.key+"><td contenteditable> " + childSnapshot.val().name +
    " </td><td contenteditable> " + childSnapshot.val().destination +
    " </td><td contenteditable> " + childSnapshot.val().frequency +
    " </td><td> " + nextArrival.format('hh:mm A') +
    " </td><td> " + minutesAway + " </td><td> " +
    " <button type='sumbit' class='btn btn-primary btn-sm edit' value=" + childSnapshot.key +
    " ><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button> " +
    " <button type='sumbit' class='btn btn-primary btn-sm delete' value=" + childSnapshot.key +
    " ><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button></td></tr>");

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