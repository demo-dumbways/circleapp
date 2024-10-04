import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'
import swaggerUI from 'swagger-ui-express'
import { PORT } from './configs/config'
import { initRedis } from './libs/redis'
import swaggerDoc from './libs/swagger.json'

import AuthControllers from './controllers/AuthControllers'
import FollowControllers from './controllers/FollowControllers'
import LikeControllers from './controllers/LikeControllers'
import ReplyControllers from './controllers/ReplyControllers'
import UserControllers from './controllers/UserControllers'
import ThreadControllers from './controllers/ThreadControllers'
import authenticate from './middlewares/authenticate'
import { rateLimiterMiddleware } from './middlewares/ratelimit'
import Redis from './middlewares/redis'
import uploader from './middlewares/upload'

const prisma = new PrismaClient()

const app = express()
const AppV1 = express.Router()
const port = PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/v1', AppV1)

AppV1.use('/', swaggerUI.serve)
AppV1.get(
    '/',
    swaggerUI.setup(swaggerDoc, {
        customSiteTitle: 'Circle App API',
        customfavIcon: 'NONE',
        customCss: `
                .swagger-ui .topbar { display: none } 
                .information-container.wrapper { background: #8e3e63; padding: 2rem } 
                .information-container .info { margin: 0 } 
                .information-container .info .main { margin: 0 !important} 
                .information-container .info .main .title { color: #ffffff} 
                .renderedMarkdown p { margin: 0 !important; color: #ffffff !important }
                `,
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
)

async function main() {
    AppV1.use(rateLimiterMiddleware)

    AppV1.post('/register', AuthControllers.register)
    AppV1.post('/login', AuthControllers.login)
    AppV1.post('/auth/forgot', AuthControllers.forgotPassword)
    AppV1.patch('/auth/reset', authenticate, AuthControllers.resetPassword)

    AppV1.get('/threads', authenticate, Redis.getThreads, ThreadControllers.getThreads)
    AppV1.get('/threads/:id', authenticate, ThreadControllers.getThread)
    AppV1.get('/threads/user/:id', authenticate, ThreadControllers.getUserThreads)
    AppV1.post('/threads', uploader.single('image'), authenticate, ThreadControllers.postThreads)
    AppV1.delete('/threads/:id', authenticate, ThreadControllers.deleteThread)

    AppV1.get('/follow/:id', authenticate, FollowControllers.follow)
    AppV1.get('/unfollow/:id', authenticate, FollowControllers.unfollow)

    AppV1.get('/find', authenticate, UserControllers.searchUser)
    AppV1.post('/likes', authenticate, LikeControllers.likeMechanism)
    AppV1.get('/me', authenticate, UserControllers.getLoggedUser)

    AppV1.get('/users/:id', authenticate, UserControllers.getUser)
    AppV1.get('/users', authenticate, UserControllers.getUsers)
    AppV1.patch(
        '/users/me',
        uploader.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'banner', maxCount: 1 },
        ]),
        authenticate,
        UserControllers.editUser
    )

    AppV1.delete('/replies/:id', authenticate, ReplyControllers.deleteReply)
    AppV1.post('/replies', uploader.single('image'), authenticate, ReplyControllers.postReply)

    app.listen(port, () => {
        console.log(`App is listening on port ${port}`)
    })
}

initRedis().then(() => {
    main()
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
})
