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

    describe(`a valid request`, () => {

        test(`is safe`, async () => {
            const before = await Blog.find({})
            await api.get('/api/users')
            const after = await Blog.find({})
            assert.deepStrictEqual(after, before)
        })

        test(`is idempotent`, async () => {
            const first = await api.get('/api/blogs')
            const second = await api.get('/api/blogs')
            assert.deepStrictEqual(second.body, first.body)
        })

        describe(`response should include`, () => {

            test(`${blogs.length} blog posts`, async () => {
                const actual = await api.get('/api/blogs')
                assert(actual.body.length, blogs.length)
            })
        
            test(`status code "200 OK"`, async () => {
                await api.get('/api/blogs').expect(200)
            })
        
            test(`json format`, async () => {
                await api.get('/api/blogs').expect('Content-Type', /application\/json/)
            })
        
            test(`each blog an "id"`, async () => {
                const { body: result } = await api.get('/api/blogs')
                assert(result.every(blog => Object.keys(blog).includes('id')))
            })
        })
    })
})

describe('POST /api/blogs', () => {

    describe('valid request', () => {

        const newBlog = {
            author: "John Doe",
            title: 'Hello, World!',
            url: 'https://example.com',
            likes: 75
          }

        describe(`database:`, () => {

            test(`should increase total blogs by one`, async () => {
                const before = await Blog.countDocuments({})
                await api.post('/api/blogs').send(newBlog)
                const after = await Blog.countDocuments({})
                assert.strictEqual(after, before + 1)
            })
        
            test(`should save newBlog's content`, async () => {
                await api.post('/api/blogs').send(newBlog)
                const result = await Blog.findOne(newBlog)
                assert(result)
            })
        })

        describe(`response should include`, () => {

            test(`status code "201 Created"`, async () => {
                await api.post('/api/blogs').send(newBlog).expect(201)
            })
        
            test(`json format`, async () => {
                await api.post('/api/blogs').send(newBlog).expect('Content-Type', /application\/json/)
            })

            test(`"id"`, async () => {
                const { body } = await api.post('/api/blogs').send(newBlog)
                assert(Object.keys(body).includes('id'))
            })
        })
    })

    describe('missing likes', () => {

        const noLikes = {
            author: "John Doe",
            title: 'Hello, World!',
            url: 'https://example.com'
        }

        test(`defaults to zero`, async () => {
            const { body: result } = await api.post('/api/blogs').send(noLikes)
            assert.strictEqual(result.likes, 0)
        })
    })

    describe('invalid requests', () => {

        const invalidBlogs = [
            {
                description: `missing "title"`,
                blog: {
                    author: "John Doe",
                    url: 'https://example.com',
                    likes: 75
                }
            },
            {
                description: `missing "url"`,
                blog: {
                    author: "John Doe",
                    title: 'Hello, World!',
                    likes: 75
                }
            }
    
        ]

        invalidBlogs.forEach(({ description, blog }) => {

            describe(`when ${description}`, () => {
            
                test(`should not save blog's content to database`, async () => {
                    const before = await Blog.find({})
                    await api.post('/api/blogs').send(blog)
                    const after = await Blog.find({})
                    assert.deepStrictEqual(before, after)
                })

                describe(`response should include`, () => {

                    test(`status code "400 Bad Request"`, async () => {
                        await api.post('/api/blogs').send(blog).expect(400)
                    })
                
                    test(`error message`, async () => {
                        const { body: result } = await api.post('/api/blogs').send(blog)
                        assert(result.error)
                    })

                    test(`error message, only`, async () => {
                        const { body } = await api.post('/api/blogs').send(blog)
                        assert(Object.keys(body).every(key => key === 'error'))
                    })
                })
            })
        })
    })
})

describe('DELETE /api/blogs/:id', () => {

    describe('valid request', () => {

        const id = "5a422a851b54a676234d17f7"

        describe(`database`, () => {

            test(`should decrease total blogs by one`, async () => {
                const before = await Blog.countDocuments({})
                await api.delete(`/api/blogs/${id}`)
                const after = await Blog.countDocuments({})
                assert.strictEqual(after, before - 1)
            })
    
            test(`should delete blog's content`, async () => {
                await api.delete(`/api/blogs/${id}`)
                const result = await Blog.findById(id)
                assert(!result)
            })
        })

        describe(`response should include`, () => {

            test(`status code "204 No Content"`, async () => {
                await api.delete(`/api/blogs/${id}`).expect(204)
            })
        })

        describe(`response should not include`, () => {

            test(`body content`, async () => {
                const { body } = await api.delete(`/api/blogs/${id}`)
                assert.strictEqual(Object.entries(body).length, 0)
            })
        })
    })

    describe('invalid requests', () => {

        const invalidRequests = [
            {
                description: 'non-existing resource',
                id: '5a422a851b54a676234d17f0',
                status: [204, "204 No Content"],
                error: false
            },
            {
                description: 'invalid ID',
                id: 'xxxxxxxxxxxxxxxxxxxxxxxx',
                status: [400, "400 Bad Request"],
                error: true
            },
            {
                description: 'missing ID',
                id: '',
                status: [404, "404 Not Found"],
                error: true
            }
        ]    

        invalidRequests.forEach(({ description, id, status, error }) => {

            describe(`when ${description}`, () => {

                assert(`database:`, () => {

                    test(`should not be changed`, async () => {
                        const before = await Blog.find({})
                        await api.delete(`/api/blogs/${id}`)
                        const after = await Blog.find({})
                        assert.deepStrictEqual(after, before)
                    })
                })

                describe(`response:`, () => {

                    test(`should include status code ${status[1]}`, async () => {
                        await api.delete(`/api/blogs/${id}`).expect(status[0])
                    })
    
                    test(`should ${ error ? '' : 'not ' }include error message`, async () => {
                        const { body } = await api.delete(`/api/blogs/${id}`)
                        assert.equal(!!body.error, error)
                    })
                })
            })
        })
    })
})

describe('PUT /api/blogs/:id', () => {

    const validRequests = [
        {
            description: 'all fields',
            id: "5a422a851b54a676234d17f7",
            blog: {
                title: "React patterns99",
                author: "Michael Chan99",
                url: "https://reactpatterns.com/99",
                likes: 99,
              }
        },
        {
            description: '"title" only',
            id: "5a422a851b54a676234d17f7",
            blog: {
                title: "React patterns99"
              }
        },
        {
            description: '"author" only',
            id: "5a422a851b54a676234d17f7",
            blog: {
                author: "Michael Chan99"
              }
        },
        {
            description: '"url" only',
            id: "5a422a851b54a676234d17f7",
            blog: {
                url: "https://reactpatterns.com/99"
              }
        },
        {
            description: '"likes" only',
            id: "5a422a851b54a676234d17f7",
            blog: {
                likes: 99
              }
        },
        {
            description: 'no fields',
            id: "5a422a851b54a676234d17f7",
            blog: {}
        },
    ]

    const invalidRequests = [
        {
            description: 'non-existing resource',
            id: '5a422a851b54a676234d17f0',
            blog: {
                title: "React patterns",
                author: "Michael Chan",
                url: "https://reactpatterns.com/",
                likes: 7,
              },
            status: [404, "404 Not Found"],
            error: false
        },
        {
            description: 'invalid ID',
            id: 'xxxxxxxxxxxxxxxxxxxxxxxx',
            blog: {
                title: "React patterns",
                author: "Michael Chan",
                url: "https://reactpatterns.com/",
                likes: 7,
              },
            status: [400, "400 Bad Request"],
            error: true
        },
        {
            description: 'missing ID',
            id: '',
            blog: {
                title: "React patterns",
                author: "Michael Chan",
                url: "https://reactpatterns.com/",
                likes: 7,
              },
            status: [404, "404 Not Found"],
            error: true
        }
    ]

    describe(`in all cases`, () => {
        
        const all = validRequests.concat(invalidRequests)

        describe(`should not change total blogs`, () => {

            all.forEach(({ description, id, blog }) => {

                test(`when updating: ${description}`, async () => {
                    const before = await Blog.countDocuments({})
                    await api.put(`/api/blogs/${id}`).send(blog)
                    const after = await Blog.countDocuments({})
                    assert.strictEqual(after, before)
                })
            }) 
        })
    })

    describe('valid requests', () => {

        validRequests.forEach(({ description, id, blog }) => {

            describe(`when ${description}`, () => {

                describe(`database:`, () => {

                    test(`should update blog's requested field(s)`, async () => {
                        await api.put(`/api/blogs/${id}`).send(blog)
                        const result = await Blog.findById(id)
    
                        assert(Object.keys(blog).every(key => blog[key] === result[key]))
                    })
                })

                describe(`response should include:`, () => {

                    test(`status code "200 OK"`, async () => {
                        await api.put(`/api/blogs/${id}`).send(blog).expect(200)
                    })
    
                    test(`json format`, async () => {
                        await api.put(`/api/blogs/${id}`).send(blog)
                            .expect('Content-Type', /application\/json/)
                    })
                })
            })
        })
    })

    describe('invalid requests', () => {

        invalidRequests.forEach(({ description, id, blog, status, error }) => {

            describe(`when ${description}`, () => {

                assert(`database:`, () => {

                    test(`should not be changed`, async () => {
                        const before = await Blog.find({})
                        await api.post(`/api/blogs/${id}`).send(blog)
                        const after = await Blog.find({})
                        assert.deepStrictEqual(after, before)
                    })
                })

                describe(`response:`, () => {

                    test(`should include status code ${status[1]}`, async () => {
                        await api.put(`/api/blogs/${id}`).send(blog).expect(status[0])
                    })
    
                    test(`should ${ error ? '' : 'not ' }include error message`, async () => {
                        const { body: result } = await api.put(`/api/blogs/${id}`).send(blog)
                        assert.equal(!!result.error, error)
                    })
                })
            })
        })
    })
})

after(async () => {
    await mongoose.connection.close()
    console.log('Connection to MongoDB closed')
})
