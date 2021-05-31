let users = [];

function addUser(userName)
{
    const user = {
        userName: userName,
        classID: null,
        className: null,
        speed: null,
        bomb_amount: null,
        bomb_range: null,
        lifes: null
    }
    users.push(user);
    return user;
}

function findUser(userName) {
    const user = users.find(u => u.userName === userName);
    return user;
}

function removeUser(userName) {
    const ID = users => users.userName === userName;
    const index = users.findIndex(ID);
    if(index !== -1)
        return users.splice(index, 1)[0];
}

function setClass(userName, classID, className, speed, bomb_amount, bomb_range, lifes)
{
    const user = findUser(userName);
    user.classID = classID;
    user.className = className;
    user.speed = speed;
    user.bomb_amount = bomb_amount;
    user.bomb_range = bomb_range;
    user.lifes = lifes;
}

function checkIfClassIsAlreadyTaken(classID)
{
    for(var user of users)
    {
        if(user.classID === classID)
            return true;
    }
    return false;
}

module.exports = {addUser, removeUser, findUser, setClass, checkIfClassIsAlreadyTaken}