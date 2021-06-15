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
        lifes: null,
        color: null,
        immortal: 0,
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

function setClass(UID, classID, className, speed, bomb_amount, bomb_range, lifes)
{
    const user = findUser(UID);
    user.classID = classID;
    user.className = className;
    user.speed = speed;
    user.bomb_amount = bomb_amount;
    user.bomb_range = bomb_range;
    user.lifes = lifes;
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

//TODO Check if player is behind wall
function getUsersInBombRadius(bombx, bomby, radius)
{
    let playersHit = [];

    users.forEach(user => {
        if(user.immortal)
            return;

        let px = user.player_xy.x;
        let py = user.player_xy.y;

        if(px === bombx && py === bomby)
        {
            user.lifes--;
            user.immortal = 3;
            playersHit.push(user);
            return;
        }

        for(let i = 1; i <= radius; i++)
        {
            if(px === bombx && (py === bomby || py === bomby-i || py === bomby+i))
            {
                user.lifes--;
                user.immortal = 3;
                playersHit.push(user);
                break;
            }
            else if(py === bomby && (px === bombx || px === bombx+i || px === bombx-i))
            {
                user.lifes--;
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

module.exports = {addUser, removeUser, findUser, setClass, setColor, setPlayerPosition, getUsers, getUsersInBombRadius, decreasePlayerImmortal}