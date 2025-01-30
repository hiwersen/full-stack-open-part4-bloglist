const dummy = blogs => 1

const totalLikes = blogs => 
    blogs.reduce((sum, { likes }) => 
        Number(likes) 
            ? sum + Number(likes)
            : sum
        , 0)

const favoriteBlog = blogs =>
    blogs.reduce((favorite, { title, author, likes }) => 
        favorite.likes >= likes
            ? favorite
            :  { title, author, likes }
        , {})

module.exports = { dummy, totalLikes, favoriteBlog }