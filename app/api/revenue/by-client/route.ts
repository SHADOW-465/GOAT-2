import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    const revenueByClient = await prisma.revenue.groupBy({
      by: ['clientId'],
      where: { year: parseInt(year) },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get client details
    const clientIds = revenueByClient.map(r => r.clientId)
    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: clientIds
        }
      },
      select: {
        id: true,
        name: true,
        company: true,
        email: true
      }
    })

    const result = revenueByClient.map(revenue => {
      const client = clients.find(c => c.id === revenue.clientId)
      return {
        clientId: revenue.clientId,
        client: client || null,
        totalRevenue: revenue._sum.amount || 0,
        transactionCount: revenue._count.id
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching revenue by client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue by client' },
      { status: 500 }
    )
  }
}
