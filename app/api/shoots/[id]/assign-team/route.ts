import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assignTeamSchema = z.object({
  assignments: z.array(z.object({
    userId: z.string(),
    role: z.string()
  }))
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { assignments } = assignTeamSchema.parse(body)

    // First, delete existing assignments for this shoot
    await prisma.shootAssignment.deleteMany({
      where: { shootId: params.id }
    })

    // Then create new assignments
    const newAssignments = await prisma.shootAssignment.createMany({
      data: assignments.map(assignment => ({
        shootId: params.id,
        userId: assignment.userId,
        role: assignment.role
      }))
    })

    // Fetch the updated shoot with assignments
    const shoot = await prisma.shoot.findUnique({
      where: { id: params.id },
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
    console.error('Error assigning team to shoot:', error)
    return NextResponse.json(
      { error: 'Failed to assign team to shoot' },
      { status: 500 }
    )
  }
}
