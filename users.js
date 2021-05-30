let users = [];

function addUser(socketID, userName, classID, className, speed, bomb_amount, bomb_range, lifes)
{
    const user = {
        socketID: socketID,
        userName: userName,
        classID: classID,
        className: className,
        speed: speed,
        bomb_amount: bomb_amount,
        bomb_range: bomb_range,
        lifes: lifes
    }
    users.push(user);
    return user;
}

function findUser(socketID) {
    const user = users.find(u => u.socketID === socketID);
    return user;
}

function removeUser(socketID) {
    const ID = users => users.socketID === socketID;
    const index = users.findIndex(ID);
    if(index !== -1)
        return users.splice(index, 1)[0];
}

module.exports = {addUser, removeUser, findUser}