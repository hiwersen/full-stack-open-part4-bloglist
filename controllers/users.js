const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

usersRouter.get('/', async (_, response) => {
    const users = await User.find({})
    response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
    const { username, password, name } = request.body

    const isPasswordValid = typeof password === 'string' && /.{3,}/.test(password)

    if (isPasswordValid) {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User({ username, passwordHash, name })
        const result = await user.save()
        response.status(201).json(result)

    } else {
        const error = new Error('invalid password')
        error.name = 'ValidationError'
        next(error)
    }
})

module.exports = usersRouter