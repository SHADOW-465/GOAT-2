import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createScriptSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  projectId: z.string().optional(),
  clientId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')

    const scripts = await prisma.script.findMany({
      where: {
        isActive: true,
        ...(clientId && { clientId }),
        ...(projectId && { projectId })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(scripts)
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createScriptSchema.parse(body)

    // For now, use a default creator ID (in real app, get from auth)
    const creatorId = 'user_1' // Default to Alex

    const script = await prisma.script.create({
      data: {
        ...data,
        creatorId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      }
    })

    // Create initial version
    await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        version: 1,
        content: data.content,
        changes: 'Initial version'
      }
    })

    return NextResponse.json(script, { status: 201 })
  } catch (error) {
    console.error('Error creating script:', error)
    return NextResponse.json(
      { error: 'Failed to create script' },
      { status: 500 }
    )
  }
}
