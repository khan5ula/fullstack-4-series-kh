/* eslint-disable no-unused-vars */
const dummy = (blogs) => {
  return 1
}

const likes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}

const mostLikes = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0])
}

// Longer version of the above

/*
const mostLikes = (blogs) => {
  return blogs.reduce(function(max, blog) {
    if (max.likes > blog.likes) {
      return max;
    } else {
      return blog;
    }
  }, blogs[0]);
}
*/

module.exports = {
  dummy,
  likes,
  mostLikes
}