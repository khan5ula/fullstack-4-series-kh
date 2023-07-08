const helper = require('./blog_helper')
const largeBlogList = require('../utils/list_of_blogs')

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = helper.likes(helper.listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of empty list is zero', () => {
    const result = helper.likes([])
    expect(result).toBe(0)
  })

  test('of a bigger list is calculated right', () => {
    const result = helper.likes(largeBlogList.blogs)
    expect(result).toBe(36)
  })
})

describe('max likes', () => {
  test('when list has only one blog that blog should have the most likes', () => {
    const result = helper.mostLikes(helper.listWithOneBlog)
    expect(result).toEqual(helper.listWithOneBlog[0])
  })

  test('of empty list is null', () => {
    const result = helper.mostLikes([])
    expect(result).toEqual(null)
  })

  test('of a bigger list is reduced right', () => {
    const result = helper.mostLikes(largeBlogList.blogs)
    expect(result).toEqual(
      largeBlogList.blogs.find(
        (blog) => blog.title === 'Canonical string reduction'
      )
    )
  })
})
