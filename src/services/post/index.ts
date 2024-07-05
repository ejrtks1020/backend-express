import { StatusCodes } from 'http-status-codes'
import { InternalServerError } from '../../errors/internalServerError/index.js'
import { getErrorMessage } from '../../errors/utils.js'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp.js'
import { Post } from '../../database/entities/Post.js'

const getAllPost = async () => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(Post).find()
        
        return dbResponse
    } catch (error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: postService.getAllPost - ${getErrorMessage(error)}`)
    }
}

export default {
  getAllPost
}