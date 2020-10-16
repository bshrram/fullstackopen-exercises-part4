const _ = require('lodash')
const blog = require('../models/blog')

const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  const reducer = (sum, item) => sum + item.likes

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
  const reducer = (max, item) => {
    if (max.likes <= item.likes) {
      return item
    }
    return max
  }

  return blogs.length === 0 ? {} : blogs.reduce(reducer, { likes: 0 })
}

const mostBlogs = blogs => {
  const authors = _.countBy(blogs, 'author')
  const res = { blogs: 0 }
  _.forIn(authors, (v, k) => {
    if (res.blogs <= v){
      res.author = k
      res.blogs= v
    }
  })
  return blogs.length === 0 ? {} : res
}

const mostLikes = blogs => {
  const authors = {}
  for (const blog of blogs){
    if (!authors[blog.author])
      authors[blog.author] = 0
    authors[blog.author]+= blog.likes
  }
  const res = { likes: 0 }
  for (const [author, likes] of Object.entries(authors)){
    if(res.likes <= likes){
      res.author = author
      res.likes = likes
    }
  }
  return blogs.length ===0 ? {} : res
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes 
}
