const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization ||req.headers.Authorization //Can be A or a so best practice to look for both

    if (!authHeader?.startsWith('Bearer ')) {  // "Bearer " Don't forget the space !!!
        return res.status(401).json({ message: "Unauthorized"})
    } 

    const token = authHeader.split(' ')[1]  //[0] would be Bearer, we want what comes just after

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden"})
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles
            next()  //don't forget next on middleware !
        }
    )
}


module.exports = verifyJWT