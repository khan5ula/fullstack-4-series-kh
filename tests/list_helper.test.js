const listHelper = require('../utils/list_helper')
const largeBlogList = require('../utils/list_of_blogs')

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

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.likes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of empty list is zero', () => {
    const result = listHelper.likes([])
    expect(result).toBe(0)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.likes(largeBlogList.blogs)
    expect(result).toBe(36)
  })
})

describe('max likes', () => {
  test('when list has only one blog that blog should have the most likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    expect(result).toEqual(listWithOneBlog[0])
  })

  test('of empty list is null', () => {
    const result = listHelper.mostLikes([])
    expect(result).toEqual(null)
  })

  test('of a bigger list is reduced right', () => {
    const result = listHelper.mostLikes(largeBlogList.blogs)
    expect(result).toEqual(blogWithLotOfLikes)
  })
})