const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, url: 1, author: 1 })
  response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.password)
    return response.status(400).json({ error: 'password missing' })
  if (body.password.length < 3)
    return response.status(400).json({ error: '`password` length must be 3 at least' })

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter