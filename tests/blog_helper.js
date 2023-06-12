const Blog = require('../models/blog')
const User = require('../models/user')

const likes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}

const mostLikes = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0])
}

const dummyUser = {
  username: 'dummy',
  name: 'Dummy User',
  password: 'passw'
}

const initialBlogs = [
  {
    title: 'First test blog',
    author: 'Someone',
    url: 'www.blogs.com',
    likes: 5
  },
  {
    title: 'Second test blog',
    author: 'Someone else',
    url: 'www.blogger.com',
    likes: 3
  }
]

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const blogWithLotOfLikes = {
  _id: '5a422b3a1b54a676234d17f9',
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  likes: 12,
  __v: 0
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  listWithOneBlog,
  blogWithLotOfLikes,
  likes,
  mostLikes,
  blogsInDb,
  usersInDb,
  dummyUser,
}