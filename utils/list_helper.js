const dummy = blogs => 1

const totalLikes = blogs => 
    blogs.reduce((sum, { likes }) => 
        Number(likes) 
            ? sum + Number(likes)
            : sum
        , 0)

module.exports = { dummy, totalLikes }