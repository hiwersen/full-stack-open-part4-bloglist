const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (_, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const { title, author, url, likes } = request.body
    const blog = new Blog({ title, author, url, likes: likes || 0 })
    const result = await blog.save()
    response.status(201).json(result)
})

module.exports = blogsRouter