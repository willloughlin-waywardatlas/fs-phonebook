const mongoose = require('mongoose')

if ( process.argv.length < 3 ) {
  console.log('give password as argument')
  process.exit(1)
} else if ( process.argv.length === 4 ) {
  console.log('input missing: provide both name and number')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.0fvlryz.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if ( process.argv.length === 5 ) {
  const contact = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  contact.save().then(() => {
    console.log('contact added!')
    mongoose.connection.close()
  })
} else {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

