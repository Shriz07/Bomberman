const io = require( "socket.io" )();
const sockethandler = {
    io: io
};

const {addUser, removeUser, findUser, setClass, getUsers, getUsersInBombRadius, decreasePlayerImmortal} = require('./users.js');
const {addBomb, removeBomb, getBombs, decreaseTimeOfBombs} = require('./bombs.js');
const {characters} = require('./characters.js');

let clientNO = 0;
let canPlace = true;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,2,2,2,2,2,2,2,0,0,0,1],
    [1,0,1,0,1,2,1,2,1,2,1,0,1,0,1],
    [1,0,0,0,2,2,2,2,2,2,2,0,0,0,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,0,0,0,2,2,2,2,2,2,2,0,0,0,1],
    [1,0,1,0,1,2,1,2,1,2,1,0,1,0,1],
    [1,0,0,0,2,2,2,2,2,2,2,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

//In the future change to some more advanced stuff
function givePlayerPosition(user)
{
    if(clientNO === 0)
    {
        user.player_xy.x = 1;
        user.player_xy.y = 1;
        user.color = 'blue';
    }
    else if(clientNO === 1)
    {
        user.player_xy.x = 13;
        user.player_xy.y = 1;
        user.color = 'red';
    }
    else if(clientNO === 2)
    {
        user.player_xy.x = 1;
        user.player_xy.y = 13;
        user.color = 'yellow';
    }
    else if(clientNO === 3)
    {
        user.player_xy.x = 13;
        user.player_xy.y = 13;
        user.color = 'magenta';
    }
    clientNO += 1;
}

//TODO check if block is behind wall
function removeWalls(x, y, radius)
{
    let blocks = [];
    for(let i = 1; i <= radius; i++)
    {
        if(y - i > 0 && map[y-i][x] === 2)
        {
            map[y-i][x] = 0;
            blocks.push({x: x, y: y-i});
        }
        if(y + i < map.length && map[y+i][x] === 2)
        {
            map[y+i][x] = 0;
            blocks.push({x: x, y: y+i});
        }
        if(x - i > 0 && map[y][x-i] === 2)
        {
            map[y][x-i] = 0;
            blocks.push({x: x-i, y: y});
        }
        if(x + i < map[0].length && map[y][x+i] === 2)
        {
            map[y][x+i] = 0;
            blocks.push({x: x+i, y:y});
        }
    }
    return blocks;
}

setInterval(function() { 
    let bombs = getBombs();
    bombs.forEach(bomb => {
        decreasePlayerImmortal();
        if(bomb.timer <= 0)
        {
            io.emit('place explode', {bomb_xy: bomb, radius: bomb.radius});
            const blocks = removeWalls(bomb.x, bomb.y, bomb.radius);
            removeBomb(bomb.x, bomb.y);
            io.emit('remove block', {blocks: blocks});

            let playersHit = getUsersInBombRadius(bomb.x, bomb.y, bomb.radius);
            playersHit.forEach(player => {
                if(player.lifes > 0)
                    io.emit('hit player', {UID: player.UID, status: 'immortal', immortal_time: 3000});
                else
                {
                    io.emit('hit player', {UID: player.UID, status: 'dead', immortal_time: 0});
                    removeUser(player.UID);
                }
            });
        } 
    }); 
    decreaseTimeOfBombs(1);
}, 1000);

io.on("connection", function( socket ) {
    console.log( "User connected" );
    var user = null;
    
    socket.on("login", function(data){
        console.log(data.UID);
        console.log(characters[parseInt(data.class_id) - 1].class_name);

        const character = characters[parseInt(data.class_id) - 1];
        user = findUser(data.UID);
        
        setClass(user.UID, character.class_id, character.class_name, character.speed, character.bomb_amount, character.bomb_range, character.lifes);
        givePlayerPosition(user);
        socket.emit('loggedIn', {user: user, map: map});
        io.emit('update player statistics', {users: getUsers()});
    });

    //Player wants to move
    socket.on("request move", function(data) {
        canMove = checkIfPlayerCanMove(user, data.direction);

        if(canMove === true)
        {
            io.emit("move player", {UID: user.UID, player_xy: user.player_xy})
            //Check if there is a bonus where player wants to move
            let bonus = false;
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
        console.log(canPlace);
        if(canPlace)
        {
            canPlace = false;
            addBomb(user.player_xy.x, user.player_xy.y, user.bomb_range, 3);
            io.emit("place bomb", {bomb_xy: {
                "x": user.player_xy.x,
                "y": user.player_xy.y
            }})
            setTimeout(() =>{canPlace = true}, 1000);
        }
    })

    socket.on('end', function(data) {
        socket.disconnect(0);
    })
});

function checkIfPlayerCanMove(player, direction)
{
    let x = player.player_xy.x;
    let y = player.player_xy.y

    if(direction === 'up')
        y -= 1;
    else if(direction === 'back')
        y += 1; 
    else if(direction === 'left')
        x -= 1;
    else if(direction === 'right')
        x += 1;

    if(map[y][x] === 0)
    {
        player.player_xy.x = x;
        player.player_xy.y = y;
        return true;
    }
    return false;
}

module.exports = sockethandler;