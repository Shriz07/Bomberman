let bombs = [];

function addBomb(x, y, radius, timer)
{
    const bomb = {
        bomb_xy: {
            x: x,
            y: y
        },
        radius: radius,
        timer: timer
    }

    bombs.push(bomb);
}

function removeBomb(x, y)
{
    let i = 0;
    bombs.forEach(bomb => {
        if(bomb.bomb_xy.x === x && bomb.bomb_xy.y === y)
        {
            bombs.splice(i, 1);
            return;
        }
        i++;
    });
}

function decreaseTimeOfBombs(seconds)
{
    bombs.forEach(bomb => {
        bomb.timer-=seconds;
    });
}

function getBombs()
{
    return bombs;
}

function clearBombs()
{
    bombs = [];
}

module.exports = {addBomb, removeBomb, getBombs, decreaseTimeOfBombs, clearBombs}