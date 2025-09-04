import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createShootSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string(),
  location: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().positive().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const shoots = await prisma.shoot.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(status && { status }),
        ...(startDate && endDate && {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
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
        },
        editingTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json(shoots)
  } catch (error) {
    console.error('Error fetching shoots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shoots' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createShootSchema.parse(body)

    const shoot = await prisma.shoot.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
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

    return NextResponse.json(shoot, { status: 201 })
  } catch (error) {
    console.error('Error creating shoot:', error)
    return NextResponse.json(
      { error: 'Failed to create shoot' },
      { status: 500 }
    )
  }
}
