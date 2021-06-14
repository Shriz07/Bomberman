var socket = io();
let user = null;
let map = null;

let oldPosition = { x: 0, y: 0};

window.addEventListener('keydown', e => {
    oldPosition.x = user.player_xy.x;
    oldPosition.y = user.player_xy.y;
    if(e.key === 'ArrowUp')
    {
        let inputDirection = "up";
        socket.emit('request move', {direction: inputDirection});
    }
    else if(e.key === 'ArrowDown')
    {
        let inputDirection = "back";
        socket.emit('request move', {direction: inputDirection});
    }
    else if(e.key === 'ArrowLeft')
    {
        let inputDirection = "left";
        socket.emit('request move', {direction: inputDirection});
    }
    else if(e.key === 'ArrowRight')
    {
        let inputDirection = "right";
        socket.emit('request move', {direction: inputDirection});
    }
    else if(e.keyCode === 32)
    {
        socket.emit('request place bomb', {});
    }
})


let lastRenderTime = 0;
const GAME_SPEED = 3;

function main(currentTime)
{
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if(secondsSinceLastRender < 1 / GAME_SPEED)
        return;

    lastRenderTime = currentTime;
}

function chooseCharacter()
{
    var character = document.getElementById('characterSelect');
    socket.emit('login', {UID: UID, class_id: character.value})
    window.requestAnimationFrame(main);
}

function drawMap()
{
    const gameBoard = document.getElementById('game-board');

    for(let i = 0; i < map[0].length; i++)
    {
        for(let j = 0; j < map.length; j++)
        {
            if(map[j][i] === 0)
                placeEmptySpace(i, j);
            if(map[j][i] === 1)
                placeWall(i, j);
        }
    }
}

function placeEmptySpace(x, y)
{
    const gameBoard = document.getElementById('game-board');

    const emptySpace = document.createElement('div');
    emptySpace.style.gridColumnStart = x+1;
    emptySpace.style.gridRowStart = y+1;
    emptySpace.classList.add('emptySpace');
    gameBoard.appendChild(emptySpace);
}

function placeWall(x, y)
{
    const gameBoard = document.getElementById('game-board');

    const wall = document.createElement('div');
    wall.style.gridColumnStart = x+1;
    wall.style.gridRowStart = y+1;
    wall.classList.add('wall');
    gameBoard.appendChild(wall);
}

function placeBomb(x, y)
{
    const gameBoard = document.getElementById('game-board');

    const wall = document.createElement('div');
    wall.style.gridColumnStart = x+1;
    wall.style.gridRowStart = y+1;
    wall.classList.add('bomb');
    gameBoard.appendChild(wall);
}

function placePlayer(playerID, color, x, y)
{
    const gameBoard = document.getElementById('game-board');

    const player = document.createElement('div');
    player.style = 'background-color: ' + color + '; border: .50vmin solid black;';
    player.style.gridColumnStart = x+1;
    player.style.gridRowStart = y+1;
    player.classList.add(playerID);
    gameBoard.appendChild(player);
}

socket.on('loggedIn', function(data) {
    user = data.user;
    console.log('Login success');
    document.getElementsByTagName('body')[0].style = 'padding: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; margin: 0; background-color: black;';
    $("#container").empty();
    $("#container").append("<div id='game-board'></div>");

    const gameBoard = document.getElementById('game-board');

    map = data.map;
    drawMap();

    placePlayer(data.user.UID, data.user.color, data.user.player_xy.x, data.user.player_xy.y);
});

socket.on('update player statistics', function(data) {
    data.users.forEach(u => {
        if(u.UID !== user.UID)
        {
            placePlayer(u.UID, u.color, u.player_xy.x, u.player_xy.y);
        }
    });
});

socket.on('move player', function(data) {
    const gameBoard = document.getElementById('game-board');
    const player = document.getElementsByClassName(data.UID);
    player[0].style.gridColumnStart = data.player_xy.x+1;
    player[0].style.gridRowStart = data.player_xy.y+1;
});

socket.on('place bomb', function(data) {
    console.log('Place bomb');
    placeBomb(data.bomb_xy.x, data.bomb_xy.y);
});