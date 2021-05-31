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

function getUsers()
{
    return users;
}

module.exports = {addUser, removeUser, findUser, setClass, setColor, setPlayerPosition, getUsers}