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

const mostBlogs = blogs => {
    const map = {}
    let mostBlogs = {}

    blogs.forEach(({ author }) => {
        map[author] = (map[author] || 0) + 1
        const blogs = map[author]
        if ( blogs > (mostBlogs.blogs || 0)) 
            mostBlogs = { author, blogs }
    })

    return mostBlogs
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }