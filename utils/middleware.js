const config = require('../utils/config')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const tokenExtractor = (request, _, next)=> {
    const token = request.get('authorization')

    if (token && token.startsWith('Bearer ')) {
        request.token = token.replace('Bearer ', '')
    }

    next()
}

const userExtractor = async (request, _, next) => {
    const tokenUser = jwt.verify(request.token, config.JWT_SECRET)

    if (!tokenUser.id) {
        const error = new Error('unknown user')
        error.name = 'AuthenticationError'
        return next(error)
    }

    const user = await User.findById(tokenUser.id)

    if (!user) {
        const error = new Error('invalid user')
        error.name = 'AuthenticationError'
        return next(error)
    }

    request.user = user

    next()
}

const unknownEndpoint = (_, response) => {
    return response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, _, response, next) => {

    console.log('error code:', error.code)
    console.log('error name:', error.name)

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    if (error.name === 'CastError') {
        return response.status(400).json({ error: error.message })
    }

    if (error.code === 11_000) {
        return response.status(400).json({ error: error.message })
    }

    if (error.name === 'AuthenticationError') {
        return response.status(401).json({ error: error.message })
    }

    if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: error.message })
    }

    if (error.name === 'AuthorizationError') {
        return response.status(403).json({ error: error.message })
    }

    next(error)
}

const middleware = { tokenExtractor , userExtractor, errorHandler, unknownEndpoint }

module.exports = middleware