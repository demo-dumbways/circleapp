import { Request, Response } from 'express'
import { ThreadType, ThreadWithDetailType } from '../types/types'
import ThreadServices from '../services/ThreadServices'
import ResponseDTO from '../dtos/ResponseDTO'
import ServiceResponseDTO from '../dtos/ServiceResponseDTO'
import Redis from '../middlewares/redis'

class ThreadControllers {
    async getThreads(req: Request, res: Response) {
        const loggedUser = res.locals.user

        const { error, payload }: ServiceResponseDTO<ThreadWithDetailType[]> =
            await ThreadServices.getThreads(loggedUser)

        if (error) {
            return res.status(500).json(
                new ResponseDTO<null>({
                    error,
                    message: payload,
                    data: null,
                })
            )
        }

        await Redis.setThreads(payload)

        return res.status(200).json(
            new ResponseDTO<ThreadWithDetailType>({
                error,
                message: {
                    status: 'Threads retrieved!',
                },
                data: payload,
            })
        )
    }

    async getThread(req: Request, res: Response) {
        const loggedUser = res.locals.user
        const { id } = req.params

        const { error, payload }: ServiceResponseDTO<ThreadWithDetailType> =
            await ThreadServices.getThread(+id, loggedUser)

        if (error) {
            return res.status(500).json(
                new ResponseDTO<null>({
                    error,
                    message: payload,
                    data: null,
                })
            )
        }

        return res.status(200).json(
            new ResponseDTO<ThreadWithDetailType>({
                error,
                message: {
                    status: 'Thread retrieved!',
                },
                data: payload,
            })
        )
    }

    async getUserThreads(req: Request, res: Response) {
        const { id } = req.params

        const { error, payload }: ServiceResponseDTO<ThreadWithDetailType[]> =
            await ThreadServices.getUserThreads(+id)

        if (error) {
            return res.status(500).json(
                new ResponseDTO<null>({
                    error,
                    message: payload,
                    data: null,
                })
            )
        }

        return res.status(200).json(
            new ResponseDTO<ThreadWithDetailType[]>({
                error,
                message: {
                    status: "User's threads retrieved!",
                },
                data: payload,
            })
        )
    }

    async postThreads(req: Request, res: Response) {
        const loggedUser = res.locals.user
        const image = req.file?.path || null
        const { content, badLabels } = req.body

        const { error, payload }: ServiceResponseDTO<ThreadType> = await ThreadServices.postThread({
            content,
            image,
            badLabels: JSON.parse(badLabels),
            authorId: loggedUser.id,
        })

        if (error) {
            return res.status(500).json(
                new ResponseDTO<null>({
                    error,
                    message: payload,
                    data: null,
                })
            )
        }

        // to make sure getAllThreads request gets the latest threads data
        await Redis.deleteThreads()

        return res.status(200).json(
            new ResponseDTO<ThreadType>({
                error,
                message: {
                    status: 'Thread posted!',
                },
                data: payload,
            })
        )
    }

    async deleteThread(req: Request, res: Response) {
        const { id } = req.params
        const { error, payload }: ServiceResponseDTO<ThreadType> = await ThreadServices.deleteThread(+id)

        if (error) {
            return res.status(500).json(
                new ResponseDTO<null>({
                    error,
                    message: payload,
                    data: null,
                })
            )
        }

        // to make sure getAllThreads request gets the latest threads data
        await Redis.deleteThreads()

        return res.status(200).json(
            new ResponseDTO<ThreadType>({
                error,
                message: {
                    status: 'Thread deleted!',
                },
                data: payload,
            })
        )
    }
}

export default new ThreadControllers()
