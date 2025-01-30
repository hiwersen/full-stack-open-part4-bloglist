require('express-async-errors')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')
const Blog = require('./models/blog')

mongoose
    .connect(MONGODB_URI)
    .then(() => console.log(`Connected to MongoDB`))
    .catch(error => console.log(`Error connecting to MongoDB: ${error.message}`))

app.use(cors())
app.use(express.json())

app.get('/api/blogs', async (_, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
    const { author, title, url, likes } = request.body
    const blog = new Blog({ title, author, url, likes: likes || 0 })
    const result = await blog.save()
    response.status(201).json(result)
})

module.exports = app


