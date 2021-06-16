let users = [];

function addUser(UID)
{
    const user = {
        UID: UID,
        classID: null,
        className: null,
        speed: null,
        bomb_amount: null,
        bomb_range: null,
        lives: null,
        color: null,
        immortal: 0,
        points: 0,
        player_xy: {
            x: 1,
            y: 1
        }
    }
    users.push(user);
    return user;
}

function findUser(UID) {
    const user = users.find(u => u.UID === UID);
    return user;
}

function removeUser(UID) {
    const ID = users => users.UID === UID;
    const index = users.findIndex(ID);
    if(index !== -1)
        return users.splice(index, 1)[0];
}

function setClass(UID, classID, className, speed, bomb_amount, bomb_range, lives)
{
    const user = findUser(UID);
    user.classID = classID;
    user.className = className;
    user.speed = speed;
    user.bomb_amount = bomb_amount;
    user.bomb_range = bomb_range;
    user.lives = lives;
}

function addBonusToUser(UID, bonus_type)
{
    const user = findUser(UID);
    if(bonus_type === 'speed')
        user.speed++;
    else if(bonus_type === 'bomb_range')
        user.bomb_range++;
    else if(bonus_type === 'bomb_amount')
        user.bomb_amount++;
}

function setColor(UID, color)
{
    const user = findUser(UID);
    user.color = color;
}

function setPlayerPosition(UID, x, y)
{
    const user = findUser(UID);
    user.player_xy.x = x;
    user.player_xy.y = y;
}

function findWinner()
{
    if(users.length === 1)
        return users[0];
    return null;
}

function getUsersInBombRadius(bombx, bomby, radius, map)
{
    let playersHit = [];
    let flagLeft = flagRight = flagUp = flagDown = true;
    if(map[bomby-1][bombx] === 1) //up
        flagUp = false;
    if(map[bomby+1][bombx] === 1) //down
        flagDown = false;
    if(map[bomby][bombx-1] === 1) //left
        flagLeft = false;
    if(map[bomby][bombx+1] === 1) //right
        flagRight = false; 

    users.forEach(user => {
        if(user.immortal)
            return;

        let px = user.player_xy.x;
        let py = user.player_xy.y;

        if(px === bombx && py === bomby)
        {
            user.lives--;
            user.immortal = 3;
            playersHit.push(user);
            return;
        }

        for(let i = 1; i <= radius; i++)
        {
            if((px === bombx && py === bomby - i && flagUp) || (px === bombx && py === bomby + i && flagDown) || (py === bomby && px === bombx - i && flagLeft) || (py === bomby && px === bombx + i && flagRight))
            {
                user.lives--;
                user.immortal = 3;
                playersHit.push(user);
                break;
            }
        }
    });
    return playersHit;
}

function decreasePlayerImmortal()
{
    users.forEach(user => {
        if(user.immortal)
            user.immortal--;
    })
}

function getUsers()
{
    return users;
}

module.exports = {addUser, removeUser, findUser, setClass, setColor, setPlayerPosition, getUsers, getUsersInBombRadius, decreasePlayerImmortal, findWinner, addBonusToUser}