import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const month = searchParams.get('month')

    // Get revenue data
    const revenueQuery: any = {
      year: parseInt(year)
    }
    
    if (month) {
      revenueQuery.month = parseInt(month)
    }

    const revenue = await prisma.revenue.findMany({
      where: revenueQuery,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    })

    // Get expenses data
    const expenses = await prisma.expense.findMany({
      where: revenueQuery
    })

    // Calculate totals
    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const profit = totalRevenue - totalExpenses

    // Group by month for trends
    const monthlyData = await prisma.revenue.groupBy({
      by: ['month'],
      where: { year: parseInt(year) },
      _sum: {
        amount: true
      },
      orderBy: {
        month: 'asc'
      }
    })

    const monthlyExpenses = await prisma.expense.groupBy({
      by: ['month'],
      where: { year: parseInt(year) },
      _sum: {
        amount: true
      },
      orderBy: {
        month: 'asc'
      }
    })

    // Create monthly trends
    const trends = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1
      const revenueData = monthlyData.find(m => m.month === monthNum)
      const expenseData = monthlyExpenses.find(m => m.month === monthNum)
      
      return {
        month: monthNum,
        revenue: revenueData?._sum.amount || 0,
        expenses: expenseData?._sum.amount || 0,
        profit: (revenueData?._sum.amount || 0) - (expenseData?._sum.amount || 0)
      }
    })

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      profit,
      trends,
      revenue,
      expenses
    })
  } catch (error) {
    console.error('Error fetching revenue overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue overview' },
      { status: 500 }
    )
  }
}
