const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const getValidToken = async () => {
  const res = await api
    .post('/api/login')
    .send({username: 'root', password: '123' })
  
  return res.body.token
}

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const rootUser = { username: 'root', password: '123' }
    const user = await api.post('/api/users').send(rootUser)
    await Blog.deleteMany({})
    const blogObjects = helper.blogs
      .map(blog => new Blog({...blog, user: user.body.id}))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.blogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    for (const blog of response.body) {
      expect(blog.id).toBeDefined()
    }
  })

  describe('addition of a new blog with root user', () => {
    test('fails with the status code 401 if a token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        title: 'test Blog',
        author: 'Bshr Ramadan',
        url:
          'www.google.com',
        likes: 50,
      } 
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
      
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length)
    })

    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'test Blog',
        author: 'Bshr Ramadan',
        url:
          'www.google.com',
        likes: 50,
      }
      const token = await getValidToken()
      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length + 1)
  
      const urls = blogsAtEnd.map(b => b.url)
      expect(urls).toContain(
        'www.google.com'
      )
    })
  
    test('likes property is default 0', async () => {
      const newBlog = {
        title: 'Blog with no likes',
        author: 'Bshr Ramadan',
        url:
          'www.google.com'
      }
      const token = await getValidToken()

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.blogs.length + 1)
  
      const createdBlog = blogsAtEnd.find(b => b.url === newBlog.url)
      expect(createdBlog).toBeDefined()
      expect(createdBlog.likes).toBe(0)
  
    })
  
    test('fails with the status code 400 if the title and url properties are missing', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        author: 'Bshr Ramadan',
      }
      const token = await getValidToken()

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(400)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length)
  
    })
  })
  
  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      const token = await getValidToken()
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer ' + token)
        .expect(204)
  
      const blogsAtEnd = await helper.blogsInDb()
  
      expect(blogsAtEnd.length).toBe(
        blogsAtStart.length - 1
      )
  
      const urls = blogsAtEnd.map(r => r.url)
  
      expect(urls).not.toContain(blogToDelete.url)
    })
  })

  describe('when there is initially one user at db', () => {
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` to be unique')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username length is less than 3', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'to',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` (`to`) is shorter')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password length is less than 3', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'bshr',
        name: 'Superuser',
        password: '12',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`password` length must be 3 at least')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password is missing', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'bshr',
        name: 'Superuser'
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('password missing')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username is missing', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        name: 'Superuser',
        password: '1233'
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` is required')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})