var express = require("express");
var router = express.Router();

const {addUser, removeUser, findUser, setClass} = require('../users.js');
const {characters} = require('../characters.js');

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

router.post("/login", function(req, res, next) {
    console.log(req.body.username);
    const user = findUser(req.body.username);
    if(user === undefined)
    {
        let newUser = addUser(req.body.username);
        res.render("choosecharacter", { status: "0", classes: characters, userName: newUser.userName });
    }
    else
    {
        console.log('User already exists');
        res.render("index", { status: "1" });
    }
});

router.post("/chooseCharacter", function(req, res, next) {
    //TODO add validation if character was already choosen
    console.log(req.body.userName);
    console.log(characters[parseInt(req.body.character) - 1].class_name);

    const user = findUser(req.body.userName);
    if(user === undefined)
        res.render("index", { title: "Express" });
    else
    {
        const character = characters[parseInt(req.body.character) - 1];
        setClass(user.userName, req.body.character, character.class_name, character.speed, character.bomb_amount, character.bomb_range, character.lifes);
        res.render("game", { user: user});
    }
})

module.exports = router;
