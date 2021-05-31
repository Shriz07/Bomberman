var socket = io();

function chooseCharacter()
{
    var character = document.getElementById('characterSelect');
    socket.emit('login', {UID: UID, class_id: character.value})
}

socket.on('class already taken', function(data) {
    console.log('class taken');
});

socket.on('loggedIn', function(data) {
    console.log('Login success');
    $("#container").empty();
    $("#container").append("<h1>Ready to start</h1>");
});