const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.headers["username"];
  const foundUser = users.find((user) => user.username === username);
  if (foundUser) {
    request.username = username;
    next();
  }else{
    return response.status(400).json({
      error: "Mensagem do erro",
    });
  }
 
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if (!name || !username) {
    return response.status(400).json({
      error: "Mensagem do erro",
    });
  }
  const foundUsername = users.find((user) => user.username === username);
  if (foundUsername) {
    return response.status(400).json({
      error: "Mensagem do erro",
    });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.username;
  const user = users.find((user) => user.username === username);
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.username;
  const { title, deadline } = request.body;
  const task = {
    id: uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const user = users.find((user) => user.username === username);
  user.todos.push(task);
  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.username;
  const { title, deadline } = request.body;
  const user = users.find((user) => user.username === username);
  const foundTask = user.todos.find((task) => task.id === id);
  if (!foundTask) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }
  const taskIndex = user.todos.findIndex((task) => task.id === id);
  user.todos[taskIndex].title = title;
  user.todos[taskIndex].deadline = new Date(deadline);
  return response.json(user.todos[taskIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.username;
  const user = users.find((user) => user.username === username);
  const foundTask = user.todos.find((task) => task.id === id);
  if (!foundTask) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }
  const taskIndex = user.todos.findIndex((task) => task.id === id);
  user.todos[taskIndex].done = true;
  return response.json(user.todos[taskIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.username;
  const user = users.find((user) => user.username === username);

  const foundTask = user.todos.find((task) => task.id === id);
  if (!foundTask) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }
  user.todos = user.todos.filter((task) => task.id !== id);
  return response.status(204).json(foundTask)
});

module.exports = app;
