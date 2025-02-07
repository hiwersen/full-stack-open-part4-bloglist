const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(204).end()

    const { user } = request

    if (user._id.toString() !== blog.user?.toString()) {
        const error = new Error('unauthorized user')
        error.name = 'AuthorizationError'
        return next(error)
    }

    user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString())
    await user.save()

    await blog.deleteOne()

    response.status(204).end()
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
    const id = request.params.id
    const { title, author, url, likes } = request.body
    const update = { title, author, url, likes }

    const { user } = request

    const result = await Blog.findOneAndUpdate(
        { _id: id, user: user._id }, 
        update, 
        { new: true, runValidators: true, context: 'query' })
    
    if (!result) {
        const blog = await Blog.findById(id)
        if (!blog) return response.status(404).end()

        const error = new Error('unauthorized user')
        error.name = 'AuthorizationError'
        return next(error)
    }

    response.json(result)
})

module.exports = blogsRouter