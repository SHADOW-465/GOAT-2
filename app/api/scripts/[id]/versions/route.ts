import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createVersionSchema = z.object({
  content: z.string().min(1),
  changes: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content, changes } = createVersionSchema.parse(body)

    // Get the current script and latest version
    const script = await prisma.script.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      }
    })

    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    const nextVersion = (script.versions[0]?.version || 0) + 1

    // Create new version
    const version = await prisma.scriptVersion.create({
      data: {
        scriptId: params.id,
        version: nextVersion,
        content,
        changes: changes || `Version ${nextVersion}`
      }
    })

    // Update the script content
    await prisma.script.update({
      where: { id: params.id },
      data: { content }
    })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Error creating script version:', error)
    return NextResponse.json(
      { error: 'Failed to create script version' },
      { status: 500 }
    )
  }
}
