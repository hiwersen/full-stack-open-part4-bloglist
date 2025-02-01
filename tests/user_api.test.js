const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const mongoose = require('mongoose')
const User = require('../models/user')

const users = [
    {
        username: "root",
        passwordHash: "$2a$10$d/wscoSXLR/lDpiqUb9.uOSiTgRfsGZ3UDCcP0Peg97AEjTBQn0yu"
    }
]

beforeEach(async () => {
    await User.deleteMany()
    await User.insertMany(users)
})

describe.only('POST /api/users', () => {

    describe('valid users', () => {

        const validUsers = [
            {
                description: 'user contains name',
                user: {
                    username: 'johndoe',
                    password: 'secure_password',
                    name: 'John Doe'
                }
            },
            {
                description: 'user does not contain name',
                user: {
                    username: 'johndoe',
                    password: 'secure_password'
                }
            }
        ]

        validUsers.forEach(({ description, user }) => {

            describe(`when ${description}`, () => {

                describe(`database:`, () => {

                    test(`should increase total users by one`, async () => {
                        const before = await User.countDocuments({})
                        await api.post('/api/users').send(user)
                        const after = await User.countDocuments({})
                        assert.strictEqual(after, before + 1)
                    })

                    test(`should save user's content`, async () => {
                        await api.post('/api/users').send(user)
                        const result = await User.findOne({ username: user.username })
                        assert(result)
                    })

                })

                describe(`response should include:`, () => {

                    test(`status code "201 Created"`, async () => {
                        await api.post('/api/users').send(user).expect(201)
                    })

                    test(`content-type json`, async () => {
                        await api.post('/api/users').send(user).expect('Content-Type', /application\/json/)
                    })

                    test(`"username"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(Object.keys(body).includes("username"))
                    })

                    test(`"id"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(Object.keys(body).includes("id"))
                    })
                })

                describe(`response should not include:`, () => {

                    test(`"passwordHash"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(!Object.keys(body).includes("passwordHash"))
                    })

                    test(`"password"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(!Object.keys(body).includes("password"))
                    })

                    test(`"_id"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(!Object.keys(body).includes("_id"))
                    })

                    test(`"__v"`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(!Object.keys(body).includes("__v"))
                    })
                })
            })
        })
    })


    describe('invalid users', () => {

        const invalidUsers = [
            {
                description: "missing password",
                user: {
                    username: "johndoe",
                    name: "John Doe"
                }
            },
            {
                description: "short password",
                user: {
                    username: "johndoe",
                    password: "se",
                    name: "John Doe"
                }
            },
            {
                description: "password is not String",
                user: {
                    username: "johndoe",
                    password: null,
                    name: "John Doe"
                }
            },
            {
                description: "missing username",
                user: {
                    password: "secure_password",
                    name: "John Doe"
                }
            },
            {
                description: "short username",
                user: {
                    username: "jo",
                    password: "secure_password",
                    name: "John Doe"
                }
            },
            {
                description: "non-unique username",
                user: {
                    username: "root",
                    password: "secure_password",
                    name: "John Doe"
                }
            }
        ]

        invalidUsers.forEach(({ description, user }) => {

            describe(`when ${description}`, () => {

                describe(`database:`, () => {

                    test(`should not increase total users by one`, async () => {
                        const before = users.length
                        await api.post('/api/users').send(user)
                        const after = await User.countDocuments({})
                        assert.strictEqual(after, before)
                    })
    
                    test(`should not save user's content`, async () => {
                        const before = await User.find({})
                        await api.post('/api/users').send(user)
                        const after = await User.find({})
                        assert.deepStrictEqual(after, before)
                    })
                })

                describe(`response should return:`, () => {

                    test(`status code "400 Bad Request"`, async () => {
                        await api.post('/api/users').send(user).expect(400)
                    })

                    test(`content-type json`, async () => {
                        await api.post('/api/users').send(user).expect('Content-Type', /application\/json/)
                    })
    
                    test(`error message`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(body.error)
                    })

                    test(`error message, only`, async () => {
                        const { body } = await api.post('/api/users').send(user)
                        assert(Object.keys(body).every(key => key === 'error'))
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