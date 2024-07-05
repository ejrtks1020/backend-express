import express, { Router, Request, Response } from 'express';
import postRouter from "./post/index.js"

const router : Router = express.Router()

router.use('/post', postRouter)

export default router
