import express from 'express'
import postController from "../../controllers/post/index.js"
const router = express.Router()

// // CREATE
// router.post('/', postController.)

// // READ
router.get('/', postController.getAllPost)

// // UPDATE
// router.put(['/', '/:id'], postController.)

// // DELETE
// router.delete(['/', '/:id'], postController.)

export default router
