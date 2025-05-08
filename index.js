require ('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person.js')
const app = express()

morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body '))

const errorHandler = (error, request, response, next) => {
  console.error(error.name)
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'ContentMissing') {
    return response.status(400).json({ error: 'Name and number cannot be blank' })
  }

  next(error)
}

app.get('/', (request,response) => {
  response.send('<h1>Hello Worlds</h1>')
})

app.get('/info', (request,response) => {
  Person.find({}).then(persons => {
    response.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    `)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if( person ) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {next(error)})
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findById(request.params.id)
    .then(existingPerson => {
      if( existingPerson ) {
        existingPerson.name = name
        existingPerson.number = number
        existingPerson.save().then(updatedPerson => {
          response.json(updatedPerson)
        })
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {next(error)})
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => {
      if( person ) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request,response, next) => {
  const body = request.body
  if(!body.name || !body.number) {
    const error = new Error('ContentMissing')
    error.name = 'ContentMissing'
    error.status = 400
    return next(error)
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

