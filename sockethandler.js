const io = require( "socket.io" )();
const sockethandler = {
    io: io
};

const {addUser, removeUser, findUser, setClass, getUsers} = require('./users.js');
const {characters} = require('./characters.js');

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]


io.on( "connection", function( socket ) {
    console.log( "User connected" );
    var user = null;
    
    socket.on("login", function(data){
        console.log(data.UID);
        console.log(characters[parseInt(data.class_id) - 1].class_name);

        const character = characters[parseInt(data.class_id) - 1];
        user = findUser(data.UID);
        
        setClass(user.UID, character.class_id, character.class_name, character.speed, character.bomb_amount, character.bomb_range, character.lifes);
        socket.emit('loggedIn', {user: user, map: map})
    });

    //Player wants to move
    socket.on("request move", function(data) {
        //Check if player can move
        let canMove = true;
        if(canMove)
        {
            io.emit("move player", {UID: user.UID, player_xy: user.player_xy})
            //Check if there is a bonus where player wants to move
            let bonus = true;
            if(bonus)
            {
                //Player has taken bonus
                io.emit("remove bonus", {bonus_xy: {
                    "x": 1,
                    "y": 1
                }});

                io.emit("update player statistics", {users: getUsers()});
            }
        }
    });

    //Player wants to place a bomb
    socket.on("request place bomb", function(data) {
        //Check if player can place a bomb
        let canPlace = true;
        if(canPlace)
        {
            io.emit("place bomb", {bomb_xy: {
                "x": 1,
                "y": 1
            }})
        }
    })
});

module.exports = sockethandler;