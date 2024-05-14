require('dotenv').config()   //allow to used in ALL files
const express= require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)
//logs every log tries

var corsOptions = {
  origin: 'https://technotes-4ljv.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
//allow public access with our options

app.use(express.json())
//allow to receive and parse json files

app.use(cookieParser())
//allow to parse cookies

app.use('/', express.static(path.join(__dirname, 'public')))
// used to request css file or images
// can also be written app.use(express.static('public')) (relative to where server file is)

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*', (req,res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: "404 Not Found"})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)
//log every errors

mongoose.connection.once('open', () => {   //try connecting to mongoDB
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on ${PORT}`)) //listen for requests
})

mongoose.connection.on('error', (err) => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
