var express = require("express");
var router = express.Router();

const {addUser, removeUser, findUser, setClass, checkIfClassIsAlreadyTaken} = require('../users.js');
const {characters} = require('../characters.js');

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

router.post("/login", function(req, res, next) {
    console.log(req.body.UID);
    const user = findUser(req.body.UID);
    if(user === undefined)
    {
        let newUser = addUser(req.body.UID);
        res.render("choosecharacter", { status: "0", classes: characters, UID: newUser.UID });
    }
    else
    {
        console.log('User already exists');
        res.render("index", { status: "1" });
    }
});

router.post("/chooseCharacter", function(req, res, next) {

    //Do wywalenia chyba

    console.log(req.body.UID);
    console.log(characters[parseInt(req.body.character) - 1].class_name);
    const character = characters[parseInt(req.body.character) - 1];
    const characterTaken = checkIfClassIsAlreadyTaken(character.class_id);

    const user = findUser(req.body.UID);
    if(user === undefined)
        res.render("index", { title: "Express" });
    else if(characterTaken === true)
        res.render("choosecharacter", { status: "1", classes: characters, UID: user.UID });
    else
    {
        setClass(user.UID, character.class_id, character.class_name, character.speed, character.bomb_amount, character.bomb_range, character.lifes);
        res.render("game", { user: user});
    }
})

module.exports = router;
