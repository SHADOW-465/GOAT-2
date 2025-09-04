import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const month = searchParams.get('month') || (new Date().getMonth() + 1).toString()

    const currentYear = parseInt(year)
    const currentMonth = parseInt(month)

    // Weekly Task Completion
    const weeklyTasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      },
      select: {
        status: true,
        createdAt: true,
        completedAt: true
      }
    })

    const weeklyCompletion = {
      total: weeklyTasks.length,
      completed: weeklyTasks.filter(t => t.status === 'completed').length,
      inProgress: weeklyTasks.filter(t => t.status === 'in_progress').length,
      pending: weeklyTasks.filter(t => t.status === 'pending').length,
      overdue: weeklyTasks.filter(t => t.status === 'overdue').length
    }

    // Upcoming Workload
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Revenue by Client (current year)
    const revenueByClient = await prisma.revenue.groupBy({
      by: ['clientId'],
      where: { year: currentYear },
      _sum: {
        amount: true
      }
    })

    const clientIds = revenueByClient.map(r => r.clientId)
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, company: true }
    })

    const revenueByClientWithNames = revenueByClient.map(revenue => {
      const client = clients.find(c => c.id === revenue.clientId)
      return {
        clientId: revenue.clientId,
        clientName: client?.name || 'Unknown',
        company: client?.company || '',
        revenue: revenue._sum.amount || 0
      }
    }).sort((a, b) => b.revenue - a.revenue)

    // Revenue Growth (year over year)
    const currentYearRevenue = await prisma.revenue.aggregate({
      where: { year: currentYear },
      _sum: { amount: true }
    })

    const previousYearRevenue = await prisma.revenue.aggregate({
      where: { year: currentYear - 1 },
      _sum: { amount: true }
    })

    const revenueGrowth = previousYearRevenue._sum.amount 
      ? ((currentYearRevenue._sum.amount || 0) - (previousYearRevenue._sum.amount || 0)) / (previousYearRevenue._sum.amount || 0) * 100
      : 0

    // Profit vs Expense
    const totalRevenue = currentYearRevenue._sum.amount || 0
    const totalExpenses = await prisma.expense.aggregate({
      where: { year: currentYear },
      _sum: { amount: true }
    })
    const profit = totalRevenue - (totalExpenses._sum.amount || 0)

    // Team Workload
    const teamWorkload = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        status: {
          in: ['pending', 'in_progress']
        }
      },
      _count: {
        id: true
      }
    })

    const userIds = teamWorkload.map(w => w.assigneeId).filter(Boolean)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, designation: true }
    })

    const teamWorkloadWithNames = teamWorkload.map(workload => {
      const user = users.find(u => u.id === workload.assigneeId)
      return {
        userId: workload.assigneeId,
        userName: user?.name || 'Unassigned',
        designation: user?.designation || '',
        taskCount: workload._count.id
      }
    }).sort((a, b) => b.taskCount - a.taskCount)

    // Productivity Score (tasks completed per user)
    const productivityData = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      },
      _count: {
        id: true
      }
    })

    const productivityWithNames = productivityData.map(data => {
      const user = users.find(u => u.id === data.assigneeId)
      return {
        userId: data.assigneeId,
        userName: user?.name || 'Unknown',
        designation: user?.designation || '',
        completedTasks: data._count.id
      }
    }).sort((a, b) => b.completedTasks - a.completedTasks)

    // Lead Conversion Rate
    const totalLeads = await prisma.lead.count()
    const convertedLeads = await prisma.lead.count({
      where: { status: 'converted' }
    })
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    return NextResponse.json({
      weeklyTaskCompletion: weeklyCompletion,
      upcomingWorkload: upcomingTasks,
      revenueByClient: revenueByClientWithNames,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      profitVsExpense: {
        revenue: totalRevenue,
        expenses: totalExpenses._sum.amount || 0,
        profit: profit
      },
      teamWorkload: teamWorkloadWithNames,
      productivityScore: productivityWithNames,
      leadConversionRate: Math.round(conversionRate * 100) / 100
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}
