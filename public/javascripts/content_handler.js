var socket = io();
let user = null;
let map = null;
let canMove = true;
let allUsers = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

window.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp' && canMove)
    {
        let inputDirection = "up";
        socket.emit('request move', {direction: inputDirection});
        canMove = false;
    }
    else if(e.key === 'ArrowDown' && canMove)
    {
        let inputDirection = "back";
        socket.emit('request move', {direction: inputDirection});
        canMove = false;
    }
    else if(e.key === 'ArrowLeft' && canMove)
    {
        let inputDirection = "left";
        socket.emit('request move', {direction: inputDirection});
        canMove = false;
    }
    else if(e.key === 'ArrowRight' && canMove)
    {
        let inputDirection = "right";
        socket.emit('request move', {direction: inputDirection});
        canMove = false;
    }
    else if(e.keyCode === 32)
        socket.emit('request place bomb', {});
})


let lastRenderTime = 0;
let characterSpeed = 1;

function main(currentTime)
{
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if(secondsSinceLastRender < 1 / characterSpeed)
        return;
    canMove = true;
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
            if(map[j][i] === 2)
            placeDestructibleWall(i, j);
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

function placeDestructibleWall(x, y)
{
    const gameBoard = document.getElementById('game-board');

    const wall = document.createElement('div');
    wall.style.gridColumnStart = x+1;
    wall.style.gridRowStart = y+1;
    wall.classList.add('destructibleWall');
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
    player.style = `background-image: url('../images/${color}.png'); z-index: 100; background-size: contain; background-repeat: no-repeat; background-position: center;`;
    player.style.gridColumnStart = x+1;
    player.style.gridRowStart = y+1;
    player.classList.add(playerID);
    gameBoard.appendChild(player);
}

async function placeExplosion(x, y)
{
    const gameBoard = document.getElementById('game-board');
    const explode = document.createElement('div');
    explode.style.gridColumnStart = x+1;
    explode.style.gridRowStart = y+1;
    explode.classList.add('explode');
    gameBoard.appendChild(explode);

    await sleep(1000);

    gameBoard.removeChild(explode);
}

async function makePlayerImmortal(playerID, time)
{
    const gameBoard = document.getElementById('game-board');
    const player = document.getElementsByClassName(playerID);
    while(time > 0)
    {
        player[0].style.opacity = '0.5';
        await sleep(250);
        player[0].style.opacity = '1';
        await sleep(250);
        time -= 500;
    }
}

async function bombExplode(x, y, radius)
{
    placeExplosion(x, y);

    let flagLeft = flagRight = flagUp = flagDown = true;
    if(map[y-1][x] === 1) //down
        flagDown = false;
    if(map[y+1][x] === 1) //up
        flagUp = false;
    if(map[y][x-1] === 1) //left
        flagLeft = false;
    if(map[y][x+1] === 1) //right
        flagRight = false; 

    for(let i = 1; i <= radius; i++)
    {
        if(x - i > 0 && flagLeft)
            placeExplosion(x-i, y);
        if(x + i < map[0].length && flagRight)
            placeExplosion(x+i, y);
        if(y - i > 0 && flagUp)
            placeExplosion(x, y-i);
        if(y + i < map.length && flagDown)
            placeExplosion(x, y+i);
    }
}

function refreshUserStatistics()
{
    document.getElementById('statistics').innerHTML = '';
    allUsers.forEach(u => {
        const stats = document.createElement('div');
        stats.style = 'border: 5px solid black;';
        const playerName = document.createElement("H2");
        const className = document.createElement("H3");
        const lifes = document.createElement("H3");
        const points = document.createElement("H3");
        playerName.appendChild(document.createTextNode('Player name: ' + u.UID));
        className.appendChild(document.createTextNode('Player class: ' + u.className));
        lifes.appendChild(document.createTextNode('Lifes: ' + u.lifes));
        points.appendChild(document.createTextNode('Points: ' + u.points));

        stats.appendChild(playerName);
        stats.appendChild(className);
        stats.appendChild(lifes);
        stats.appendChild(points);
        
        document.getElementById('statistics').appendChild(stats);
    });
}

function decreasePlayerLifes(UID)
{
    allUsers.forEach(u => {
        if(u.UID === UID)
            u.lifes--;
    });
}

socket.on('loggedIn', function(data) {
    user = data.user;
    characterSpeed = user.speed;
    console.log('Login success');
    document.getElementsByClassName('container')[0].style.display = 'inherit';
    document.getElementsByTagName('body')[0].style = 'padding: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; margin: 0; background-color: black;';
    $("#container").empty();
    $("#container").append("<div id='game-board'></div>");
    $("#container").append("<div id='statistics'></div>");

    map = data.map;
    drawMap();

    placePlayer(data.user.UID, data.user.color, data.user.player_xy.x, data.user.player_xy.y);
});


socket.on('update player statistics', function(data) {
    allUsers = data.users;
    data.users.forEach(u => {
        if(u.UID !== user.UID)
        {
            placePlayer(u.UID, u.color, u.player_xy.x, u.player_xy.y);
        }
    });
    refreshUserStatistics();
});

socket.on('move player', function(data) {
    const gameBoard = document.getElementById('game-board');
    const player = document.getElementsByClassName(data.UID);
    player[0].style.gridColumnStart = data.player_xy.x+1;
    player[0].style.gridRowStart = data.player_xy.y+1;
});

socket.on('place bomb', function(data) {
    placeBomb(data.bomb_xy.x, data.bomb_xy.y);
});

socket.on('place explode', function(data) {
    placeEmptySpace(data.bomb_xy.x, data.bomb_xy.y);
    bombExplode(data.bomb_xy.x, data.bomb_xy.y, data.radius);
});

socket.on('remove block', function(data) {
    data.blocks.forEach(block => {
        placeEmptySpace(block.x, block.y);
    });
});

socket.on('hit player', function(data) {
    if(data.status === 'dead')
    {
        if(user.UID === data.UID)
            socket.emit('end', {});
        $('.' + data.UID).remove();
    }
    else
        makePlayerImmortal(data.UID, data.immortal_time);
    decreasePlayerLifes(data.UID);
    refreshUserStatistics();
});

socket.on('game over', function(data) {
    alert(`Player ${data.winner} has won`);
})