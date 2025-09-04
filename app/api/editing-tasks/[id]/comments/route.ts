import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1),
  userId: z.string()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { editingTaskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content, userId } = createCommentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        editingTaskId: params.id,
        userId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
