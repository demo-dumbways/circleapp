import { Prisma, PrismaClient } from '@prisma/client'
import { UserType, ThreadType, ThreadWithDetailType } from '../types/types'
import ServiceResponseDTO from '../dtos/ServiceResponseDTO'
import ThreadDTO from '../dtos/ThreadDTO'
import CircleError from '../utils/CircleError'
import { threadSchema } from '../validators/validators'
import primsaErrorHandler from '../utils/PrismaError'

const prisma = new PrismaClient()

class ThreadServices {
    async getThreads(loggedUser: UserType): Promise<ServiceResponseDTO<ThreadWithDetailType[]>> {
        try {
            const rawThreads: ThreadWithDetailType[] = await prisma.thread.findMany({
                include: {
                    replies: true,
                    likes: true,
                    author: true,
                },
            })

            const threads: ThreadWithDetailType[] = rawThreads.map((thread) => {
                const { replies, likes, author, ...rest } = thread

                delete author.createdAt
                delete author.updatedAt
                delete author.password
                delete rest.updatedAt

                return {
                    ...rest,
                    author,
                    totalReplies: replies.length,
                    totalLikes: likes.length,
                    isLiked: thread.likes.some((like) => like.authorId === loggedUser.id),
                }
            })

            return new ServiceResponseDTO<ThreadWithDetailType[]>({
                error: false,
                payload: threads.sort((x, y) => {
                    const xInMs = x.createdAt.getTime()
                    const yInMs = y.createdAt.getTime()

                    return yInMs - xInMs
                }),
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return new ServiceResponseDTO({
                    error: true,
                    payload: primsaErrorHandler(error),
                })
            }
            return new ServiceResponseDTO({
                error: true,
                payload: error,
            })
        }
    }

    async getThread(
        id: number,
        loggedUser: UserType
    ): Promise<ServiceResponseDTO<ThreadWithDetailType>> {
        try {
            const rawThread: ThreadWithDetailType = await prisma.thread.findUnique({
                where: {
                    id: id,
                },
                include: {
                    replies: true,
                    likes: true,
                    author: true,
                },
            })

            if (!rawThread) {
                throw new CircleError({ error: 'Requested thread does not exist.' })
            }

            const thread = {
                ...rawThread,
                likes: rawThread.likes.map((like) => {
                    delete like.createdAt
                    delete like.updatedAt
                    return like
                }),
                totalReplies: rawThread.replies.length,
                totalLikes: rawThread.likes.length,
                isLiked: rawThread.likes.some((like) => like.authorId === loggedUser.id),
                replies: rawThread.replies.sort((x, y) => {
                    const xInMs = x.createdAt.getTime()
                    const yInMs = y.createdAt.getTime()

                    return yInMs - xInMs
                }),
            }

            delete thread.updatedAt
            delete thread.author.createdAt
            delete thread.author.updatedAt
            delete thread.author.password

            return new ServiceResponseDTO<ThreadWithDetailType>({
                error: false,
                payload: thread,
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return new ServiceResponseDTO({
                    error: true,
                    payload: primsaErrorHandler(error),
                })
            }
            return new ServiceResponseDTO({
                error: true,
                payload: error,
            })
        }
    }

    async getUserThreads(id: number): Promise<ServiceResponseDTO<ThreadWithDetailType[]>> {
        try {
            const rawThreads: ThreadWithDetailType[] = await prisma.thread.findMany({
                where: {
                    authorId: id,
                },
                include: {
                    replies: true,
                    likes: true,
                },
            })

            if (!rawThreads.length) {
                throw new CircleError({ error: 'Requested user does not have any threads.' })
            }

            const threads = rawThreads.map((thread) => {
                const { replies, likes, ...rest } = thread

                return {
                    ...rest,
                    totalReplies: replies.length,
                    totalLikes: likes.length,
                }
            })

            return new ServiceResponseDTO<ThreadWithDetailType[]>({
                error: false,
                payload: threads,
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return new ServiceResponseDTO({
                    error: true,
                    payload: primsaErrorHandler(error),
                })
            }
            return new ServiceResponseDTO({
                error: true,
                payload: error,
            })
        }
    }

    async postThread(threadDTO: ThreadDTO): Promise<ServiceResponseDTO<ThreadType>> {
        try {
            const { error } = threadSchema.validate(threadDTO)

            if (error) {
                throw new CircleError({ error: error.details[0].message })
            }

            const postedThread = await prisma.thread.create({
                data: threadDTO,
            })

            return new ServiceResponseDTO<ThreadType>({
                error: false,
                payload: postedThread,
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return new ServiceResponseDTO({
                    error: true,
                    payload: primsaErrorHandler(error),
                })
            }
            return new ServiceResponseDTO({
                error: true,
                payload: error,
            })
        }
    }

    async deleteThread(id: number): Promise<ServiceResponseDTO<ThreadType>> {
        try {
            const deletedThreads = await prisma.thread.delete({
                where: {
                    id: id,
                },
            })

            return new ServiceResponseDTO({
                error: false,
                payload: deletedThreads,
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return new ServiceResponseDTO({
                    error: true,
                    payload: primsaErrorHandler(error),
                })
            }
            return new ServiceResponseDTO({
                error: true,
                payload: error,
            })
        }
    }
}

export default new ThreadServices()
