const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (_, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(404).end()
    response.json(blog)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const { user } = request
    const { title, author, url, likes } = request.body
    const blog = new Blog({ title, author, url, likes: (likes || 0 ), user: user._id })
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    response.status(201).json(result)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    
    if (!blog) return response.status(404).end()

    const { user } = request

    if (user._id.toString() !== blog.user?.toString()) {
        const error = new Error('unauthorized user')
        error.name = 'AuthorizationError'
        return next(error)
    }

    await blog.deleteOne()

    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const { title, author, url, likes } = request.body
    const blog = { title, author, url, likes }
    const result = await Blog
        .findByIdAndUpdate(id, blog, { new: true, runValidators: true, context: 'query' })
    if (!result) return response.status(404).end()
    response.json(result)
})

module.exports = blogsRouter