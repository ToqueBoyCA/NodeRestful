// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

//EVENT HANDLERS

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
    
    //User update
    $('#userList table tbody').on('click', 'td a.linkupdateuser', changeUserInfo);
    
    //Cancel update button clicked
    $('#btnCancelUpdateUser').on('click', togglePanels);
    
    //Add class to udpated fields
    $('#updateUser input').on('change', function(){$(this).addClass('updated')});
    
    //Update user button click
    $('#btnUpdateUser').on('click', updateUser);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // Stick our user data array into a userlist variable in the global object
        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a>/<a href="#" class="linkupdateuser" rel="'+this._id+'">update</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    populateInfoBox(thisUserObject);

};

//Toggle the viewing of the update pane
function togglePanels(){
  $('#addUserPanel').toggle();
  $('#updateUserPanel').toggle();
}

function populateInfoBox(user){
  if(user === null)
  {
    var tempUser = {
      'fullname':'',
      'age':'',
      'location':'',
      'gender':''
    }      
    user = tempUser;
  }
  //Populate Info Box
  $('#userInfoUserName').text(user.username);
  $('#userInfoEmail').text(user.email);
  $('#userInfoFullName').text(user.fullname);
  $('#userInfoAge').text(user.age);
  $('#userInfoGender').text(user.gender);
  $('#userInfoLocation').text(user.location);
}

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event){
  
  event.preventDefault();
  
  //Pop up confirmation dialog 
  var confirmation = confirm('Are you sure you want to delete this user?');
  
  //Chekc and make sure that it was confirmed
  if(confirmation === true){
    
    //if confirmed lets delete 
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteuser/'+$(this).attr('rel')
    }).done(function(response){
      
      //check for successful (blank) response 
      if(response.msg === ''){
      }
      else {
        alert('Error: '+response.msg);
      }
      
      //Update the table 
      populateTable();
      populateInfoBox(null);
      
    });
  }
  else {    
    //If they said no to the confirm do nothing
    return false;
  }
};

//Put user info into the pane 
function changeUserInfo(event){
  
  event.preventDefault();
  
  if($('#addUserPanel').is(":visible")){
    togglePanels();
  }
  
  //Get index of object based on _id 
  var _id = $(this).attr('rel');
  var arrayPosition = userListData.map(function(arrayItem) {return arrayItem._id;}).indexOf(_id);
  
  //Get the user object
  var thisUserObject = userListData[arrayPosition];
  
  //populateInfoBox
  $('#updateUserFullname').val(thisUserObject.fullname);
  $('#updateUserAge').val(thisUserObject.age);
  $('#updateUserGender').val(thisUserObject.gender);
  $('#updateUserLocation').val(thisUserObject.location);
  $('#updateUserName').val(thisUserObject.username);
  $('#updateUserEmail').val(thisUserObject.email);
  
  //Put the userID into the REL of the 'update user' block
  $('#updateUser').attr('rel',thisUserObject._id);
  
  
  }
  function updateUser(event){
    
    event.preventDefault();
    
    //Pop up confirmation dialog that they actually want to save the user data
    var confirmation = confirm('Are you sure you want to update this user?');
    
    //Check that they do want to save
    if(confirmation === true){
      //get the id of the user from the REL. **don't think i need to do this, should be able to use "this"
      var _id = $('#updateUser').attr('rel');
      
      //create a collection of the udpated fields
      var fieldsToBeUpdated = $('#updateUser input.updated');
      
      //create an object of the pairs
      var updatedFields ={};
      $(fieldsToBeUpdated).each(function(){
        var key = $(this).attr('placeholder').replace(" ","").toLowerCase();
        var value = $(this).val();
        updatedFields[key]=value;
      });
      console.log(updatedFields);
      $.ajax({
        type: 'PUT',
        url: '/users/updateuser/' + _id,
        data: updatedFields
      }).done(function( response ) {
        
        //Check for successful (blank) response
        if(response.msg==='' || response.msg === "null"){
          togglePanels();
        }
        else{
          alert('Error: '+response.msg);
        }
        //update the table
        populateTable();
        
      } );
      
    }
    else{
      //Must have clicked the wrong button
      return false;
    }
  }