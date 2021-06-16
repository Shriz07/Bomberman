const io = require( "socket.io" )();
const sockethandler = {
    io: io
};

const {addUser, removeUser, findUser, setClass, getUsers, getUsersInBombRadius, decreasePlayerImmortal, findWinner, addBonusToUser, countUsersAlive} = require('./users.js');
const {addBomb, removeBomb, getBombs, decreaseTimeOfBombs, clearBombs} = require('./bombs.js');
const {generateRandomBonuses, getBonuses, checkIfPlayerIsOnBonus, clearBonuses} = require('./bonuses.js');
const {getMap} = require('./map.js');
const {characters} = require('./characters.js');

let clientNO = 0;
let canPlace = true;
const MAXIMUM_PLAYERS = 4; //For testing change it to 1 so that the game will immediately start

let map = [
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

generateRandomBonuses(10, map);

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
    clientNO++;
}

function checIfAllPlayersConnected()
{
    if(MAXIMUM_PLAYERS < 1 || MAXIMUM_PLAYERS > 4)
    {
        console.log('Maximum players should be between 1 and 4');
        return false;
    }
    return clientNO === MAXIMUM_PLAYERS ? true : false;
}

function resetMap()
{
    map = getMap();
}

function resetGame()
{
    resetMap();
    clearBombs();
    clearBonuses();
    clientNO = 0;
    const users = getUsers();
    users.forEach(u => {
        const character = characters[parseInt(u.classID) - 1];
        setClass(u.UID, character);
        givePlayerPosition(u);
    });
    if(checIfAllPlayersConnected())
    {
        io.emit('start game', {users: getUsers(), map: map});
        const bonuses = getBonuses();
        bonuses.forEach(bonus => {
            io.emit('place bonus', {bonus_type: bonus.type, bonus_xy: bonus.bonus_xy});
        });
    }
}

function removeWalls(x, y, radius)
{
    let blocks = [];
    let flagLeft = flagRight = flagUp = flagDown = true;
    if(map[y-1][x] === 1) //up
        flagUp = false;
    if(map[y+1][x] === 1) //down
        flagDown = false;
    if(map[y][x-1] === 1) //left
        flagLeft = false;
    if(map[y][x+1] === 1) //right
        flagRight = false; 


    for(let i = 1; i <= radius; i++)
    { 
        if(y - i > 0 && map[y-i][x] === 2 && flagUp)
        {
            map[y-i][x] = 0;
            blocks.push({x: x, y: y-i});
        }
        if(y + i < map.length && map[y+i][x] === 2 && flagDown)
        {
            map[y+i][x] = 0;
            blocks.push({x: x, y: y+i});
        }
        if(x - i > 0 && map[y][x-i] === 2 && flagLeft)
        {
            map[y][x-i] = 0;
            blocks.push({x: x-i, y: y});
        }
        if(x + i < map[0].length && map[y][x+i] === 2 && flagRight)
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

            let playersHit = getUsersInBombRadius(bomb.x, bomb.y, bomb.radius, map);
            playersHit.forEach(player => {
                if(player.lives > 0)
                    io.emit('hit player', {UID: player.UID, status: 'immortal', immortal_time: 3000});
                else
                {
                    io.emit('hit player', {UID: player.UID, status: 'dead'});
                    
                    let usersAlive = countUsersAlive();
                    let winner = null;
                    if(usersAlive === 1)
                        winner = findWinner();
                    else if(usersAlive <= 0)
                        winner = 'No one';

                    if(winner !== null)
                    {
                        io.emit('game over', {winner: winner.UID});
                        resetGame();
                    }
                }
            });
        } 
    }); 
    decreaseTimeOfBombs(1);
}, 1000);

io.on("connection", function( socket ) {
    var user = null;
    
    socket.on("login", function(data){
        console.log(data.UID);
        console.log(characters[parseInt(data.class_id) - 1].class_name);

        const character = characters[parseInt(data.class_id) - 1];
        user = findUser(data.UID);
        
        setClass(user.UID, character);
        givePlayerPosition(user);
        socket.emit('loggedIn', {user: user, map: map});
        
        if(checIfAllPlayersConnected())
        {
            io.emit('start game', {users: getUsers(), map: map});
            const bonuses = getBonuses();
            bonuses.forEach(bonus => {
                io.emit('place bonus', {bonus_type: bonus.type, bonus_xy: bonus.bonus_xy});
            });
        }
    });

    //Player wants to move
    socket.on("request move", function(data) {
        canMove = checkIfPlayerCanMove(user, data.direction);
        if(canMove === true)
        {
            io.emit("move player", {UID: user.UID, player_xy: user.player_xy})
            //Check if there is a bonus where player wants to move
            const bonus = checkIfPlayerIsOnBonus(user.player_xy.x, user.player_xy.y);
            if(bonus !== null)
            {
                addBonusToUser(user.UID, bonus.type);
                //Player has taken bonus
                io.emit("remove bonus", {bonus_xy: bonus.bonus_xy});
                io.emit("update player statistics", {users: getUsers()});
            }
        }
    });

    //Player wants to place a bomb
    socket.on("request place bomb", function(data) {
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

    socket.on('disconnect', function(data) {
        if(user != null)
        {
            io.emit('hit player', {UID: user.UID, status: 'dead'});
            removeUser(user.UID);
            clientNO--;
            io.emit("update player statistics", {users: getUsers()});
            socket.disconnect(0);
        }
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