const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(express.static('dist'))

app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :info'))
morgan.token('info', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return
  }
})

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Test</h1>')
  })

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/info', (req, res) => {
  const numberOfPeople = persons.length
  const currentTime = new Date()
  res.send(`<p>Phonebook has info for ${numberOfPeople} people</p> <p>${currentTime}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random() * 100000)
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'number is missing'
    })
  }

  const alreadyExists = persons.some(person => person.name === body.name)

  if(alreadyExists) {
    return res.status(400).json({
      error: 'person already exists'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})