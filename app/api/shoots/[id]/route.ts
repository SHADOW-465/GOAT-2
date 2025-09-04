import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateShootSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.string().optional(),
  budget: z.number().positive().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shoot = await prisma.shoot.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            address: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                designation: true,
                phone: true
              }
            }
          }
        },
        editingTasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
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
          }
        }
      }
    })

    if (!shoot) {
      return NextResponse.json(
        { error: 'Shoot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(shoot)
  } catch (error) {
    console.error('Error fetching shoot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shoot' },
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
    const data = updateShootSchema.parse(body)

    const shoot = await prisma.shoot.update({
      where: { id: params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        assignments: {
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
        }
      }
    })

    return NextResponse.json(shoot)
  } catch (error) {
    console.error('Error updating shoot:', error)
    return NextResponse.json(
      { error: 'Failed to update shoot' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.shoot.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shoot:', error)
    return NextResponse.json(
      { error: 'Failed to delete shoot' },
      { status: 500 }
    )
  }
}
