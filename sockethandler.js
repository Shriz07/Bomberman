const io = require( "socket.io" )();
const sockethandler = {
    io: io
};

const {addUser, removeUser, findUser, setClass, checkIfClassIsAlreadyTaken} = require('./users.js');
const {characters} = require('./characters.js');


io.on( "connection", function( socket ) {
    console.log( "User connected" );
    
    socket.on("login", function(data){
        console.log(data.UID);
        console.log(characters[parseInt(data.class_id) - 1].class_name);

        const character = characters[parseInt(data.class_id) - 1];
        const characterTaken = checkIfClassIsAlreadyTaken(character.class_id);
        const user = findUser(data.UID);
        if(characterTaken === true)
            socket.emit('class already taken', {});
        else
        {
            setClass(user.UID, character.class_id, character.class_name, character.speed, character.bomb_amount, character.bomb_range, character.lifes);
            socket.emit('loggedIn', {user: user})
        }
    });
});

module.exports = sockethandler;