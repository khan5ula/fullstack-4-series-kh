const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password must have minimum of 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.delete('/:id', userExtractor, async (request, response) => {
  const userToBeRemoved = await User.findById(request.params.id)

  if (!userToBeRemoved) {
    return response.status(404).json({ error: 'user not found' })
  }

  const userId = request.user

  console.log(`User Id from request: ${userId}`)
  console.log(`User Id from the found user: ${userToBeRemoved.id.toString()}`)

  if (userToBeRemoved.id.toString() !== userId) {
    return response
      .status(401)
      .json({
        error:
          'not authorized: only a logged in user can delete their own account',
      })
  }

  /* Delete all blogs made by the user */
  await Blog.deleteMany({ user: userToBeRemoved.id })

  /* Delete the user */
  await User.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

module.exports = usersRouter
