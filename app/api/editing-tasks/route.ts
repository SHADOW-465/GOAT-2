import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEditingTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  shootId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const editingTasks = await prisma.editingTask.findMany({
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
        shoot: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(editingTasks)
  } catch (error) {
    console.error('Error fetching editing tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editing tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createEditingTaskSchema.parse(body)

    const editingTask = await prisma.editingTask.create({
      data: {
        ...data,
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
        shoot: {
          select: {
            id: true,
            title: true,
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

    return NextResponse.json(editingTask, { status: 201 })
  } catch (error) {
    console.error('Error creating editing task:', error)
    return NextResponse.json(
      { error: 'Failed to create editing task' },
      { status: 500 }
    )
  }
}
