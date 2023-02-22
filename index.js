require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const app = express();

morgan.token('body', (req, res) => {
  if (req.method === 'POST') return JSON.stringify(req.body);
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ');
  })
);

app.get('/info', (req, res, next) => {
  res
    .end(
      `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  `
    )
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return json.status(400).json({
      error: 'name or number missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((newPerson) => {
      res.json(newPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
