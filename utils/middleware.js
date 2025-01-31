const errorHandler = (error, _, response, next) => {
    
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const middleware = { errorHandler }

module.exports = middleware