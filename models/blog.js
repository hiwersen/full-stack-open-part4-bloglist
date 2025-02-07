const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: String,
    url: {
        type: String,
        required: true
    },
    likes: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = returnedDocument._id
        delete returnedDocument._id
        delete returnedDocument.__v
    } 
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog