// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const likes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}

module.exports = {
  dummy,
  likes
}