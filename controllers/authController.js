const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

//@desc Login
//@route POST /auth
//@access Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required"})
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: "Unauthorized1"})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: "Unauthorized2"})

    const accessToken = jwt.sign(
        {
            "UserInfo": {    //info inserted in the accessToken
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
    )
    
    //Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: "None", //cross-site cookie if needed
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry set to match refreshToken
    })

    //send accessToken containing username and roles
    res.json({ accessToken})   //client app receives accesstoken, server sets cookie so client doesn't handle refreshToken
})

//@desc Refresh
//@route GET /auth/refresh
//@access Public - because access token has expired
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies
 
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized3"})
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler( async(err, decoded) => {  //verify process already completed here
            if (err) return res.status(403).json({ message: "Forbidden"}) // err == error from the verify process, asyncH should catch other errors

            const foundUser = await User.findOne({ username : decoded.username})

            if (!foundUser) {
                return res.status(401).json({ message: "Unauthorized4"})
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {    //info inserted in the accessToken
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15mn" }
            )

            res.json({ accessToken })
        })
    )
})

//@desc Logout
//@route POST /auth/logout
//@access Public - Just to clear cookies if exists
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.sendStatus(204)  //No content

    res.clearCookie('jwt', {httpOnly: true, sameSite: "None", secure: true}) //have to pass same options

    res.json ({ message: "Cookie cleared"})  // status 200 by default
})

module.exports = { login, refresh, logout}