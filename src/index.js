const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers


  const user = users.find(u => u.username === username)

  if (!user)
    return response.status(404).json({ error: 'User not Found' })

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.find(u => u.username === username)

  if (userExists) {
    response.status(400).json({ error: 'username already exists' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date()
  }

  user.todos.push(newTodo)

  response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find(t => t.id === id)

  if (!todo) {
    response.status(404).send({ error: 'Todo is not exist' })
  }

  todo.title = title
  todo.deadline = deadline

  response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const todo = user.todos.find(t => t.id === id)

  if (!todo) {
    response.status(404).send({ error: 'Todo is not exist' })
  }

  todo.done = true

  response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const {user} = request
  const index = user.todos.findIndex(t => t.id === id)

  if (index < 0) {
    response.status(404).send({ error: 'Todo is not exist' })
  }

  user.todos.splice(index, 1)

  response.status(204).send()
});

module.exports = app;