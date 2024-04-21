var express = require('express');
var router = express.Router();
var todoController = require('../controllers/todo')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'View All Todos' });

});

router.get('/insert', function(req, res, next) {
    res.render('insert', { title: 'Insert a Todo' });
});

// route to get all todos
router.get('/todos', function (req, res, next) {
    todoController.getAll().then(todos => {
        console.log(todos);
        return res.status(200).send(todos);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

// route to add a new todo
router.post('/add-todo', function(req, res, next) {
    console.log("Received a todo: " + req.body.text);
    todoController.create(req.body).then(todo => {
        console.log(todo);
        res.status(200).send(todo);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

module.exports = router;
