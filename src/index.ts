import express from 'express'
import { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import http from 'http'
import basicAuth from 'express-basic-auth'
// import { Server } from 'socket.io'
import { DataSource } from 'typeorm'
// import { IChatFlow } from './Interface'
// import { getNodeModulesPackagePath, getEncryptionKey } from './utils'
import logger, { expressRequestLogger } from './utils/logger.js'
import { getDataSource } from './DataSource.js'
// import { NodesPool } from './NodesPool'
// import { ChatFlow } from './database/entities/ChatFlow'
// import { ChatflowPool } from './ChatflowPool'
// import { CachePool } from './CachePool'
// import { initializeRateLimiter } from './utils/rateLimit'
// import { getAPIKeys } from './utils/apiKey'
import { getCorsOptions, getAllowedIframeOrigins, sanitizeMiddleware } from './utils/XSS.js'
// import { Telemetry } from './utils/telemetry'
import router from './routes/index.js'
import errorHandlerMiddleware from './middlewares/errors/index.js'

// declare global {
//     namespace Express {
//         interface Request {
//             io?: Server
//         }
//     }
// }

export class App {
    app: express.Application
    // telemetry: Telemetry
    AppDataSource: DataSource = getDataSource()

    constructor() {
        this.app = express()
    }

    async initDatabase() {
        // Initialize database
        try {
            await this.AppDataSource.initialize()
            logger.info('📦 [server]: Data Source is initializing...')

            // Run Migrations Scripts
            await this.AppDataSource.runMigrations({ transaction: 'each' })

            logger.info('📦 [server]: Data Source has been initialized!')
        } catch (error) {
            logger.error('❌ [server]: Error during Data Source initialization:', error)
        }
    }

    async config() {
        // Limit is needed to allow sending/receiving base64 encoded string
        if (process.env.NUMBER_OF_PROXIES && parseInt(process.env.NUMBER_OF_PROXIES) > 0)
            this.app.set('trust proxy', parseInt(process.env.NUMBER_OF_PROXIES))

        // Allow access from specified domains
        this.app.use(cors(getCorsOptions()))

        // Allow embedding from specified domains.
        this.app.use((req, res, next) => {
            const allowedOrigins = getAllowedIframeOrigins()
            if (allowedOrigins == '*') {
                next()
            } else {
                const csp = `frame-ancestors ${allowedOrigins}`
                res.setHeader('Content-Security-Policy', csp)
                next()
            }
        })

        // Switch off the default 'X-Powered-By: Express' header
        this.app.disable('x-powered-by')

        // Add the expressRequestLogger middleware to log all requests
        this.app.use(expressRequestLogger)

        // Add the sanitizeMiddleware to guard against XSS
        this.app.use(sanitizeMiddleware)

        // // Make io accessible to our router on req.io
        // this.app.use((req, res, next) => {
        //     req.io = socketIO
        //     next()
        // })
        this.app.use('/api/v1', router)

        // ----------------------------------------
        // Configure number of proxies in Host Environment
        // ----------------------------------------
        this.app.get('/api/v1/ip', (request, response) => {
            response.send({
                ip: request.ip,
                msg: 'Check returned IP address in the response.'
            })
        })

        // ----------------------------------------
        // Serve UI static
        // ----------------------------------------

        // const packagePath = getNodeModulesPackagePath('ui')
        // const uiBuildPath = path.join(packagePath, 'build')
        // const uiHtmlPath = path.join(packagePath, 'build', 'index.html')

        // this.app.use('/', express.static(uiBuildPath))

        // All other requests not handled will return React app
        // this.app.use((req: Request, res: Response) => {
        //     res.sendFile(uiHtmlPath)
        // })

        // Error handling
        this.app.use(errorHandlerMiddleware)
    }

    async stopApp() {
        try {
            const removePromises: any[] = []
            await Promise.all(removePromises)
        } catch (e) {
            logger.error(`❌[server]: Server shut down error: ${e}`)
        }
    }
}

let serverApp: App | undefined

export async function start(): Promise<void> {

    serverApp = new App()

    const port = 5500
    const server = http.createServer(serverApp.app)

    await serverApp.initDatabase()
    await serverApp.config()

    server.listen(port, () => {
        logger.info(`⚡️ [server]: Server is listening at ${port}`)
    })
}

export function getInstance(): App | undefined {
    return serverApp
}
