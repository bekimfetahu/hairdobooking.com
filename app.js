import next from 'next'
import http from 'http'
import path from 'path'
import fs from 'fs'
import util from 'util'

const dev = process.env.NODE_ENV !== 'production'

// Logging setup
const logFile = path.resolve('./logs/node.log')
fs.mkdirSync(path.dirname(logFile), { recursive: true })

const logStdout = process.stdout
console.log = function (...args) {
    logStdout.write(util.format(...args) + '\n')
    fs.appendFileSync(logFile, util.format(...args) + '\n')
}
console.error = console.log

// Next.js setup
const app = next({ dev, dir: path.resolve('./') })
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        // Passenger provides the port via process.env.PORT or fallback to 3000
        const port = process.env.PORT || 3000
        http.createServer((req, res) => {
            console.log(`Incoming request: ${req.method} ${req.url}`)
            handle(req, res)
        }).listen(port, () => {
            console.log(`Next.js server listening on port ${port}`)
        })
    })
    .catch(err => {
        console.error('Next.js failed to start:', err)
        process.exit(1)
    })
