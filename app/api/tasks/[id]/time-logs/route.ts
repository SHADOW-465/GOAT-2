import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTimeLogSchema = z.object({
  userId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().positive().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timeLogs = await prisma.timeLog.findMany({
      where: { taskId: params.id },
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json(timeLogs)
  } catch (error) {
    console.error('Error fetching time logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time logs' },
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
    const data = createTimeLogSchema.parse(body)

    const timeLog = await prisma.timeLog.create({
      data: {
        ...data,
        taskId: params.id,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined
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

    // Update task actual hours
    if (data.duration) {
      const task = await prisma.task.findUnique({
        where: { id: params.id },
        select: { actualHours: true }
      })

      const newActualHours = (task?.actualHours || 0) + data.duration

      await prisma.task.update({
        where: { id: params.id },
        data: { actualHours: newActualHours }
      })
    }

    return NextResponse.json(timeLog, { status: 201 })
  } catch (error) {
    console.error('Error creating time log:', error)
    return NextResponse.json(
      { error: 'Failed to create time log' },
      { status: 500 }
    )
  }
}
