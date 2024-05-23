/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node <script-file> <password> [<name> <number>]')
  process.exit(1)
}

const password = process.argv[2]
const argName = process.argv[3]
const argNumber = process.argv[4]

const url = `mongodb+srv://duanegadama:${password}@cluster0.4zhouvb.mongodb.net/phoneApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  // fecth and display all entries in phone book
  Person.find({}).then(result=>{
    console.log('phonebook:')
    result.forEach(person=>{
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  // Add new entry to phone book
  const person = new Person({
    name: argName,
    number: argNumber,
  })

  person.save().then(result=>{
    console.log(`added ${argName} number ${argNumber} to phonebook`)
    mongoose.connection.close()
  })

} else {
  console.log('Please provide both name and number to add a new entry, or just the password to list all entries')
  process.exit(1)
}