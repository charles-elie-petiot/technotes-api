const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')    // \t : tabulation
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`       // \n : new line

    try {
        //check if directory already exists
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {    // '..' : go back 1 directory
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs')) //make it if it doesn't already exists
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch(err) {
        console.log(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.header.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = { logEvents, logger}