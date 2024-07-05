import {Args, Command, Flags} from '@oclif/core'
import path from 'path'
import dotenv from 'dotenv'
import logger from '../utils/logger.js'
import * as Server from '../index.js'
import * as DataSource from '../DataSource.js'
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true })

enum EXIT_CODE {
  SUCCESS = 0,
  FAILED = 1
}
let processExitCode = EXIT_CODE.SUCCESS


export default class Start extends Command {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    NAME: Flags.string({char: 'n', description: 'name to print'}),
    HOST: Flags.string({char: 'n', description: 'name to print'}),
  }

  async stopProcess() {
    logger.info('Shutting down...')
    try {
        // Shut down the app after timeout if it ever stuck removing pools
        setTimeout(() => {
            logger.info('server was forced to shut down after 30 secs')
            process.exit(processExitCode)
        }, 30000)

        // Removing pools
        // const serverApp = Server.getInstance()
        // if (serverApp) await serverApp.stopApp()
    } catch (error) {
        logger.error('There was an error shutting down...', error)
    }
    process.exit(processExitCode)
}  

  public async run(): Promise<void> {
    process.on('SIGTERM', this.stopProcess)
    process.on('SIGINT', this.stopProcess)

    // Prevent throw new Error from crashing the app
    // TODO: Get rid of this and send proper error message to ui
    process.on('uncaughtException', (err) => {
        logger.error('uncaughtException: ', err)
    })

    process.on('unhandledRejection', (err) => {
        logger.error('unhandledRejection: ', err)
    })    

    const {args, flags} = await this.parse(Start)
    if (flags.NAME) process.env.NAME = flags.NAME
    if (flags.HOST) process.env.HOST = flags.HOST

    await (async () => {
      try {
          logger.info('Starting Server...')
          await DataSource.init()
          await Server.start()
      } catch (error) {
          logger.error('There was an error starting...', error)
          processExitCode = EXIT_CODE.FAILED
          // @ts-ignore
          process.emit('SIGINT')
      }
    })()    
    
  }
}
