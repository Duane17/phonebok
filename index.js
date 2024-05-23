require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

morgan.token('body', (req, res) => JSON.stringify(req.body) || '-');

app.use(bodyParser.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
};

app.use(requestLogger);

const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => {
          return `Person validation failed: ${err.path}: Path \`${err.path}\` (\`${err.value}\`) is ${err.kind === 'minlength' ? 'shorter' : 'longer'} than the minimum allowed length (${err.properties.minlength}).`;
      });
      return response.status(400).json({ error: messages.join(' ') });
  }

  next(error);
};

app.get('/', (request, response) => {
    response.send('<h1>Welcome to phone book!</h1>');
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    });
});

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            const currentTime = new Date();
            const info = `
            <p><strong>Phonebook has info for ${count} people</strong></p>
            <p><strong>${currentTime}</strong></p>
            `;
            response.send(info);
        })
        .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        });
    }

    Person.findOne({ name: body.name })
        .then(existingPerson => {
            if (existingPerson) {
                return response.status(400).json({ error: 'name must be unique' });
            }

            const person = new Person({
                name: body.name,
                number: body.number
            });

            person.save().then(savedPerson => {
                response.json(savedPerson);
            }).catch(error => next(error));
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.put('/api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number missing' });
    }

    Person.findOneAndUpdate({ name: body.name }, { number: body.number }, { new: true })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson);
            } else {
                response.status(404).json({ error: 'person not found' });
            }
        })
        .catch(error => next(error));
});

app.use(unknownEndPoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
