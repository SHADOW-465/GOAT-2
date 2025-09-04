import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const years = searchParams.get('years') || '2' // Default to 2 years

    const currentYear = new Date().getFullYear()
    const startYear = currentYear - parseInt(years) + 1

    // Get revenue trends by year and month
    const revenueTrends = await prisma.revenue.findMany({
      where: {
        year: {
          gte: startYear,
          lte: currentYear
        }
      },
      select: {
        year: true,
        month: true,
        amount: true
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    })

    // Get expense trends
    const expenseTrends = await prisma.expense.findMany({
      where: {
        year: {
          gte: startYear,
          lte: currentYear
        }
      },
      select: {
        year: true,
        month: true,
        amount: true
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    })

    // Calculate year-over-year growth
    const yearlyRevenue = await prisma.revenue.groupBy({
      by: ['year'],
      where: {
        year: {
          gte: startYear,
          lte: currentYear
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        year: 'asc'
      }
    })

    const yearlyExpenses = await prisma.expense.groupBy({
      by: ['year'],
      where: {
        year: {
          gte: startYear,
          lte: currentYear
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        year: 'asc'
      }
    })

    // Calculate growth rates
    const growthRates = []
    for (let i = 1; i < yearlyRevenue.length; i++) {
      const currentYear = yearlyRevenue[i]
      const previousYear = yearlyRevenue[i - 1]
      const currentExpenses = yearlyExpenses.find(e => e.year === currentYear.year)?._sum.amount || 0
      const previousExpenses = yearlyExpenses.find(e => e.year === previousYear.year)?._sum.amount || 0
      
      const revenueGrowth = previousYear._sum.amount 
        ? ((currentYear._sum.amount || 0) - (previousYear._sum.amount || 0)) / (previousYear._sum.amount || 0) * 100
        : 0
      
      const profitGrowth = (previousYear._sum.amount || 0) - previousExpenses
        ? (((currentYear._sum.amount || 0) - currentExpenses) - ((previousYear._sum.amount || 0) - previousExpenses)) / ((previousYear._sum.amount || 0) - previousExpenses) * 100
        : 0

      growthRates.push({
        year: currentYear.year,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        profitGrowth: Math.round(profitGrowth * 100) / 100
      })
    }

    return NextResponse.json({
      revenueTrends,
      expenseTrends,
      yearlyRevenue,
      yearlyExpenses,
      growthRates
    })
  } catch (error) {
    console.error('Error fetching revenue trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue trends' },
      { status: 500 }
    )
  }
}
