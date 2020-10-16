const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

const listWithOneBlog = helper.listWithOneBlog
const blogs = helper.blogs

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})

describe('favoriteBlog', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual({})
  })

  test('when list has only one blog is the same blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    expect(result).toEqual(listWithOneBlog[0])
  })

  test('of a bigger list is a blog with the most likes number', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(blogs[2])
  })
})

describe('mostBlogs', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual({})
  })

  test('when list has only one blog is the author of that', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    expect(result).toEqual({ author: listWithOneBlog[0].author, blogs: 1 })
  })

  test('of a bigger list is the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual({ author: blogs[3].author, blogs: 3 })
  })
})

describe('mostLikes', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostLikes([])
    expect(result).toEqual({})
  })

  test('when list has only one blog is the author of that', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    expect(result).toEqual({ author: listWithOneBlog[0].author, likes: 5 })
  })

  test('of a bigger list is the author with the most likes', () => {
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual({ author: blogs[1].author, likes: 17 })
  })
})
