import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  value: z.number().positive().optional(),
  notes: z.string().optional(),
  assigneeId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assigneeId = searchParams.get('assigneeId')
    const source = searchParams.get('source')

    const leads = await prisma.lead.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(assigneeId && { assigneeId }),
        ...(source && { source })
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createLeadSchema.parse(body)

    // For now, use a default creator ID (in real app, get from auth)
    const creatorId = 'user_2' // Default to Mia (executive)

    const lead = await prisma.lead.create({
      data: {
        ...data,
        creatorId
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
        }
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
