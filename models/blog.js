const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: {
        type: Number,
        required: true
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = returnedDocument._id.toString()
        delete returnedDocument._id
        delete returnedDocument.__v
    } 
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog