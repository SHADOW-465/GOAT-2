import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const tasks = await prisma.task.findMany({
      where: {
        ...(assigneeId && { assigneeId }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        timeLogs: {
          select: {
            id: true,
            duration: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTaskSchema.parse(body)

    // For now, use a default creator ID (in real app, get from auth)
    const creatorId = 'user_1' // Default to Alex

    const task = await prisma.task.create({
      data: {
        ...data,
        creatorId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
