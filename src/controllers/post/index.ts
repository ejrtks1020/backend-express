import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import logger from '../../utils/logger.js'

import { InternalServerError } from '../../errors/internalServerError/index.js'
import postService from '../../services/post/index.js'

// Get api keys
const getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await postService.getAllPost()
        logger.info("test")
        
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getAllPost
}
