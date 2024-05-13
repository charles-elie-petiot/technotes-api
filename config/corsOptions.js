const allowedOrigins = require('./allowedOrigin')

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {    //check if origin allowed (no origin => ok)
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,  //allow credentials header,
    optionsSuccessStatus: 200
}

module.exports = corsOptions