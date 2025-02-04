const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minLength: 3,
        required: true,
        unique: true
    },
    passwordHash: String,
    name: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = returnedDocument._id.toString()
        delete returnedDocument.passwordHash
        delete returnedDocument._id
        delete returnedDocument.__v
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User