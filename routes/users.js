var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

module.exports = router;


/*
criar uma db para as accounts,
cada account requer username e password, mas pode gravar mais info
criar uma pagina para sign up e uma para login (signup.jade e login.jade)
fazer authenticação no login procurando pelo username e password correspondentes
Pergunta: como sei se alguem ta logged in ou nao?



*/