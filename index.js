require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

const Person = require('./models/person');

morgan.token('body', (req, res) => {
  if (req.method === 'POST') return JSON.stringify(req.body);
});
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};
const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

app.use(cors());
app.use(express.json());
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
app.use(express.static('build'));

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((result) => {
      res.end(`
    <p>Phonebook has info for ${result.length} people</p>
    <p>${new Date()}</p>
    `);
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      if (persons) {
        res.json(persons);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (
    body.name === '' ||
    body.name === undefined ||
    body.number === '' ||
    body.number === undefined
  ) {
    return res.status(400).json({
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

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    number: body.number,
  };

  //? not checking for empty number?
  //? and if i check it conflicts with frontend error messaging

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
