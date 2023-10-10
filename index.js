require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()

app.use(express.static("dist"))

app.use(express.json())

app.use(cors())

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :info"))
morgan.token("info", (req, res) => {
	if (req.method === "POST") {
		return JSON.stringify(req.body)
	} else {
		return
	}
})

/* let persons = [
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
 */
app.get("/", (req, res) => {
	res.send("<h1>Test</h1>")
})

app.get("/api/persons", (request, response) => {
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

app.get("/api/info", (req, res) => {
	const currentTime = new Date()

	Person.countDocuments({})
		.then(count => {
			res.send(`<p>Phonebook has info for ${count} people</p> <p>${currentTime}</p>`)
		})

	/* res.send(`<p>Phonebook has info for ${numberOfPeople} people</p> <p>${currentTime}</p>`) */
})

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).end()
			}
		})
		.catch(error => next(error))
})
/*   const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  } */

app.delete("/api/persons/:id", (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

/* const generateId = () => {
  return Math.floor(Math.random() * 100000)
} */

app.post("/api/persons", (req, res, next) => {
	const body = req.body

	if (!body.name) {
		return res.status(400).json({
			error: "name is missing"
		})
	}

	if (!body.number) {
		return res.status(400).json({
			error: "number is missing"
		})
	}

	/*   const alreadyExists = Person.findOne({ name: body.name })

  if(alreadyExists) {
    Person.findOne({ name: body.name })
      .then(returnedData => {
        console.log(returnedData._id.toString())
      })
    console.log('Person already in the phonebook.')
  }  */

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person.save()
		.then(savedPerson => {
			res.json(savedPerson)
		})
		.catch(error => next(error))

})

app.put("/api/persons/:id", (req, res, next) => {
	const body = req.body

	/*   if I wanted to allow name change as well:

  const person = {
    name: body.name,
    number: body.number,
  } */

	const newNumber = body.number

	Person.findByIdAndUpdate(req.params.id, { $set: { number: newNumber } }, { new: true, runValidators: true, context: "query" } )
		.then(updatedPerson => {
			res.json(updatedPerson)
			console.log("Number updated.")
		})
		.catch(error => next(error))

})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.error(error.message)

	if (error.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" })
	} else if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message })
	}

	next(error)
}
// This one being last middleware is intentional
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})