const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowsMs: 60 * 1000, // 1 minute
    max: 5, // Limit each Ip to 5 login requests per 'window' per minute
    message: 
        { message: 'Too many login attemps from this IP, please try again after a 60 second pause'},
    handler: (req, res, newt, options) => {  //handle what happens IF limit is acheived
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
            'errorLog.log')
            res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true,  //Return rate limit info in the 'rateLimit-*' headers, recommanded in documentation
    legacyHeaders: false   // Disable the 'X-RateLimit-*' headers
})

module.exports = loginLimiter