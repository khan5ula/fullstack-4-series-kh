const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const body = request.body
  const blog = await Blog.findById(request.params.id)
  console.log(JSON.stringify(body))

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (!body.comment) {
    return response.status(400).json({ error: 'comment missing' })
  }

  blog.comments = blog.comments.concat({ text: body.comment })
  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = await User.findById(request.user)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blogToBeRemoved = await Blog.findById(request.params.id)

  const user = request.user

  console.log(`User Id from request: ${user}`)
  console.log(`User Id from blog: ${blogToBeRemoved.user.toString()}`)

  if (blogToBeRemoved.user.toString() !== user) {
    return response
      .status(401)
      .json({ error: 'not authorized: only the creator can delete a blog' })
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', userExtractor, (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { username: 1, name: 1 })
    .then((updatedBlog) => {
      response.json(updatedBlog)
    })
    .catch((error) => next(error))
})

module.exports = blogsRouter
