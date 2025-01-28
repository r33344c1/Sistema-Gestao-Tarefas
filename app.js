const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Configuração do servidor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar a tabela de tarefas, caso não exista
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT
    );
  `);
});

// Rota para visualizar todas as tarefas
app.get('/', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('index', { tasks: rows });
  });
});

// Rota para adicionar uma nova tarefa
app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  const { title, description } = req.body;
  db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

// Rota para editar uma tarefa
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      throw err;
    }
    res.render('edit', { task: row });
  });
});

app.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.run('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

// Rota para excluir uma tarefa
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

// Iniciar o servidor
const port = 3008; 
app.listen(port, () => {
  console.log(`Servidor rodando em: http://localhost:${port}`);
});
