import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEditingTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  shootId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['editing', 'draft_ready', 'in_review', 'approved']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const editingTask = await prisma.editingTask.findUnique({
      where: { id: params.id },
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
                name: true,
                company: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    })

    if (!editingTask) {
      return NextResponse.json(
        { error: 'Editing task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(editingTask)
  } catch (error) {
    console.error('Error fetching editing task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editing task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateEditingTaskSchema.parse(body)

    const editingTask = await prisma.editingTask.update({
      where: { id: params.id },
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

    return NextResponse.json(editingTask)
  } catch (error) {
    console.error('Error updating editing task:', error)
    return NextResponse.json(
      { error: 'Failed to update editing task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.editingTask.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting editing task:', error)
    return NextResponse.json(
      { error: 'Failed to delete editing task' },
      { status: 500 }
    )
  }
}
