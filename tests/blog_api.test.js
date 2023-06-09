const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)
  expect(contents).toContain(
    'Second test blog')
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'This blog is valid and should be received',
    author: 'Master Await',
    url: 'https://www.await.net',
    likes: 12
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const contents = blogsAtEnd.map(n => n.title)
  expect(contents).toContain(
    'This blog is valid and should be received'
  )
})

test('invalid blog should not be added', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const blogWithoutTitle = {
    title: '',
    author: 'Master Await',
    url: 'https://www.await.net',
    likes: 12
  }

  const blogWithoutAuthor = {
    title: 'This blog is valid and should be received',
    author: '',
    url: 'https://www.await.net',
    likes: 12
  }

  await api
    .post('/api/blogs')
    .send(blogWithoutTitle)
    .expect(400)

  await api
    .post('/api/blogs')
    .send(blogWithoutAuthor)
    .expect(400)

  /* The amount of blogs on the database should not have been increased */
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
})

test('the id field should be labeled id instead of _id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)

  const newBlog = response.body[0]
  expect(newBlog.id).toBeDefined()
})

test('empty likes should result in likes of 0', async () => {
  const blogWithoutLikes = {
    title: 'This should have 0 likes',
    author: 'Master Await',
    url: 'https://www.await.net'
  }

  await api
    .post('/api/blogs')
    .send(blogWithoutLikes)
    .expect(200)

  const response = await api
    .get('/api/blogs')
    .expect(200)

  const fetchedBlog = response.body.find(blog => blog.title === blogWithoutLikes.title)
  expect(fetchedBlog.likes).toBe(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})