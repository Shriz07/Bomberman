let bonuses = [];

let bonus_names = ['speed', 'bomb_range', 'bomb_amount'];

function addBonus(x, y, type)
{
    const bonus = {
        bonus_xy: {
            x: x,
            y: y
        },
        type: type
    }

    bonuses.push(bonus);
}

function removeBonus(x, y)
{
    let i = 0;
    bonuses.forEach(bonus => {
        if(bonus.bonus_xy.x === x && bonus.bonus_xy.y === y)
        {
            bonuses.splice(i, 1);
            return;
        }
        i++;
    });
}

function getBonuses()
{
    return bonuses;
}

function checkIfPlayerIsOnBonus(x, y)
{
    for(let bonus of bonuses)
    {
        if(x === bonus.bonus_xy.x && y === bonus.bonus_xy.y)
        {
            removeBonus(x, y);
            return bonus;
        }
    }
    return null;
}

function checkIfBonusAtGivenPositionExists(x, y)
{
    for(let bonus of bonuses)
    {
        if(x === bonus.bonus_xy.x && y === bonus.bonus_xy.y)
            return true;
    }
    return false;
}

//TODO Generate bonuses only under destructible walls
function generateRandomBonuses(quantity, map)
{
    x = 5;
    for(let i = 1; i <= quantity; i++)
    {
        const randomBonus = Math.floor(Math.random() * bonus_names.length);
        let wall = true;
        let randX, randY;
        while(wall)
        {
            randX = Math.floor(Math.random() * map[0].length);
            randY = Math.floor(Math.random() * map.length);
            const alreadyExists = checkIfBonusAtGivenPositionExists(randX, randY);
            if(map[randY][randX] === 2 && !alreadyExists)
                wall = false;
        }
        addBonus(randX, randY, bonus_names[randomBonus]);
    }
}

module.exports = {addBonus, removeBonus, getBonuses, generateRandomBonuses, checkIfPlayerIsOnBonus}