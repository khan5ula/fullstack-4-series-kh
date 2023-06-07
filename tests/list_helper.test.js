const listHelper = require('../utils/list_helper')
const largeBlogList = require('../utils/list_of_blogs')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
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