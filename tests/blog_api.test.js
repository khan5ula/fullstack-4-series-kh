const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

/* This block works with tokens */
describe('when there is initially some blogs saved', () => {
  let token = null

  beforeAll(async () => {
    /* Create one dummy user */
    await api
      .post('/api/users')
      .send(helper.dummyUser)
      .expect(201)

    const response = await api
      .post('/api/login')
      .send({ username: helper.dummyUser.username, password: helper.dummyUser.password })

    token = response.body.token

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

  test('the id field should be labeled id instead of _id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)

    const newBlog = response.body[0]
    expect(newBlog.id).toBeDefined()
  })

  afterAll(async () => {
    const user = await User.findOne({ username: helper.dummyUser.username })
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
})

/* this block works with tokens */
describe('addition of a new blog', () => {
  let token = null

  beforeAll(async () => {
    /* Create one dummy user */
    await api
      .post('/api/users')
      .send(helper.dummyUser)
      .expect(201)

    const response = await api
      .post('/api/login')
      .send({ username: helper.dummyUser.username, password: helper.dummyUser.password })

    token = response.body.token
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'This blog is valid and should be received',
      author: 'Master Await',
      url: 'https://www.await.net',
      likes: 12
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
      title: 'This blog is invalid and should not be received',
      author: '',
      url: 'https://www.await.net',
      likes: 12
    }

    const blogWithoutUrl = {
      title: 'This blog is invalid and should not be received',
      author: 'Someone without a website',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutAuthor)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('empty likes should result in likes of 0', async () => {
    const blogWithoutLikes = {
      title: 'This should have 0 likes',
      author: 'Master Await',
      url: 'https://www.await.net'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutLikes)
      .expect(200)

    const response = await api
      .get('/api/blogs')
      .expect(200)

    const fetchedBlog = response.body.find(blog => blog.title === blogWithoutLikes.title)
    expect(fetchedBlog.likes).toBe(0)
  })

  afterAll(async () => {
    const user = await User.findOne({ username: helper.dummyUser.username })
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
}),

/* This block works with tokens */
describe('removal of blogs', () => {
  let token = null

  beforeAll(async () => {
    /* Create one dummy user */
    await api
      .post('/api/users')
      .send(helper.dummyUser)
      .expect(201)

    const response = await api
      .post('/api/login')
      .send({ username: helper.dummyUser.username, password: helper.dummyUser.password })

    token = response.body.token
  })

  test('a newly added blog should be deleted succesfully', async () => {
    const newBlog = {
      title: 'This blog will be deleted soon',
      author: 'Author To-Be Removed',
      url: 'https://www.deletion.org',
      likes: 1
    }

    /* A blog with the title of newBlog should not be found yet */
    let response = await api.get('/api/blogs')
    let fetchedBlog = response.body.find(blog => blog.title === newBlog.title)
    expect(fetchedBlog).toBeUndefined()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)

    response = await api
      .get('/api/blogs')
      .expect(200)

    /* newBlog should be received */
    fetchedBlog = response.body.find(blog => blog.title === newBlog.title)
    expect(fetchedBlog.title).toContain(newBlog.title)

    await api
      .delete(`/api/blogs/${fetchedBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    response = await api
      .get('/api/blogs')
      .expect(200)

    /* The blog should now be unavailable */
    fetchedBlog = response.body.find(blog => blog.title === newBlog.title)
    expect(fetchedBlog).toBeUndefined()
  })

  test('number of blogs should decrease after deleting a blog', async () => {
    const newBlog = {
      title: 'This blog will be deleted soon',
      author: 'Author To-Be Removed',
      url: 'https://www.deletion.org',
      likes: 1
    }

    /* A blog with the title of newBlog should not be found yet */
    let response = await api.get('/api/blogs')
    let fetchedBlog = response.body.find(blog => blog.title === newBlog.title)
    expect(fetchedBlog).toBeUndefined()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)

    response = await api
      .get('/api/blogs')
      .expect(200)

    /* newBlog should be received */
    fetchedBlog = response.body.find(blog => blog.title === newBlog.title)
    expect(fetchedBlog.title).toContain(newBlog.title)

    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${fetchedBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    response = await api
      .get('/api/blogs')
      .expect(200)

    /* The number of blogs in the database should have been deacreased by one */
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
  })

  afterAll(async () => {
    const user = await User.findOne({ username: helper.dummyUser.username })
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
}),

describe('editing blogs', () => {
  let token = null

  beforeAll(async () => {
    /* Create one dummy user */
    await api
      .post('/api/users')
      .send(helper.dummyUser)
      .expect(201)

    const response = await api
      .post('/api/login')
      .send({ username: helper.dummyUser.username, password: helper.dummyUser.password })

    token = response.body.token
  })

  test('blog variables should be changed', async () => {
    const newBlog = {
      title: 'This blog will be edited soon',
      author: 'Author To-Be Edited',
      url: 'https://www.edition.org',
      likes: 1
    }

    const responseAfterPost = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)

    const id = responseAfterPost.body.id

    const editedBlog = {
      title: 'The title of this blog is now edited',
      author: 'Author McNow-Edited',
      url: 'https://www.edition.org',
      likes: 100
    }

    await api
      .put(`/api/blogs/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(editedBlog)
      .expect(200)

    const responseAfterEdit = await api
      .get('/api/blogs')
      .expect(200)

    const receivedBlog = responseAfterEdit.body.find(blog => blog.id === id)

    /* Title, author and likes should be updated */
    expect(receivedBlog.title).toEqual(editedBlog.title)
    expect(receivedBlog.author).toEqual(editedBlog.author)
    expect(receivedBlog.likes).toEqual(editedBlog.likes)

    /* URL should be the same with the original blog */
    expect(receivedBlog.url).toEqual(newBlog.url)
  })

  afterAll(async () => {
    const user = await User.findOne({ username: helper.dummyUser.username })
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
}),

/* This block works with tokens */
describe('user related tests', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()
    let token = null

    /* Create one dummy user */
    await api
      .post('/api/users')
      .send(helper.dummyUser)
      .expect(201)

    const response = await api
      .post('/api/login')
      .send({ username: helper.dummyUser.username, password: helper.dummyUser.password })

    token = response.body.token

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(helper.dummyUser.username)

    const user = await User.findOne({ username: helper.dummyUser.username })
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('new user with invalid info should not be accepted', async () => {
    /* Test too short username */
    var newUser = {
      username: 'ro',
      name: 'root',
      password: 'salasana',
    }

    var result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('is shorter than the minimum allowed length')

    /* Test too short password */
    newUser = {
      username: 'acceptable',
      name: 'mr accept',
      password: 'ff',
    }

    result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('password must have minimum of 3 characters')
  })
})

afterAll(async () => {
  await User.deleteMany()
  await Blog.deleteMany()
  await mongoose.connection.close()
})