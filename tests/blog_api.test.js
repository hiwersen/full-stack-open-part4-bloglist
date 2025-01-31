const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const mongoose = require('mongoose')

const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    }  
  ]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(blogs)
})

describe('GET /api/blogs', () => {

    test(`should return ${blogs.length} blog posts`, async () => {
        const actual = await api.get('/api/blogs')
        assert(actual.body.length, blogs.length)
    })

    test(`should return status code "200 OK"`, async () => {
        await api.get('/api/blogs').expect(200)
    })

    test(`should return json format`, async () => {
        await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    })

    test(`every blog should contain "id" property`, async () => {
        const { body: result } = await api.get('/api/blogs')
        assert(result.every(blog => Object.keys(blog).includes('id')))
    })

    test(`every blog should not contain "_id" property`, async () => {
        const { body: result } = await api.get('/api/blogs')
        assert(result.every(blog => !Object.keys(blog).includes('_id')))
    })

})

describe('POST /api/blogs', () => {

    const newBlog = {
        author: "John Doe",
        title: 'Hello, World!',
        url: 'https://example.com',
        likes: 75
      }

    test(`should increase total blogs by one`, async () => {
        await api.post('/api/blogs').send(newBlog)
        const after = await Blog.find({})
        const actual = after.length
        const expected = blogs.length + 1
        assert.strictEqual(actual, expected)
    })

    test(`should save newBlog's content to DB`, async () => {
        await api.post('/api/blogs').send(newBlog)
        let actual = await Blog.findOne(newBlog)

        if (actual) {
            actual = actual?.toJSON()
            delete actual.id
        }

        assert.deepStrictEqual(actual, newBlog)
    })

    test(`should return status code "201 Created"`, async () => {
        await api.post('/api/blogs').send(newBlog).expect(201)
    })

    test(`should return json format`, async () => {
        await api.post('/api/blogs').send(newBlog).expect('Content-Type', /application\/json/)
    })

})

after(async () => {
    await mongoose.connection.close()
    console.log('Connection to MongoDB closed')
})
