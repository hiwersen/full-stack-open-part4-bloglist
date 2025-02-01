const unknownEndpoint = (_, response) => {
    return response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, _, response, next) => {

    console.log('error code:', error.code)

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    if (error.name === 'CastError') {
        return response.status(400).json({ error: error.message })
    }

    if (error.code === 11_000) {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const middleware = { errorHandler, unknownEndpoint }

module.exports = middleware