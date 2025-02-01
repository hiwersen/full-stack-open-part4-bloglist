const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (_, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(404).end()
    response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
    const { title, author, url, likes } = request.body
    const blog = new Blog({ title, author, url, likes: likes || 0 })
    const result = await blog.save()
    response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
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