import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  const alex = await prisma.user.upsert({
    where: { email: 'alex.employee@goat.media' },
    update: {},
    create: {
      id: 'user_1',
      email: 'alex.employee@goat.media',
      name: 'Alex Johnson',
      role: 'employee',
      designation: 'Content Creator',
      phone: '+1-555-0101',
      department: 'Content'
    }
  })

  const mia = await prisma.user.upsert({
    where: { email: 'mia.exec@goat.media' },
    update: {},
    create: {
      id: 'user_2',
      email: 'mia.exec@goat.media',
      name: 'Mia Rodriguez',
      role: 'executive',
      designation: 'Executive Director',
      phone: '+1-555-0102',
      department: 'Executive'
    }
  })

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.editor@goat.media' },
    update: {},
    create: {
      id: 'user_3',
      email: 'sarah.editor@goat.media',
      name: 'Sarah Chen',
      role: 'employee',
      designation: 'Video Editor',
      phone: '+1-555-0103',
      department: 'Post-Production'
    }
  })

  const mike = await prisma.user.upsert({
    where: { email: 'mike.director@goat.media' },
    update: {},
    create: {
      id: 'user_4',
      email: 'mike.director@goat.media',
      name: 'Mike Thompson',
      role: 'employee',
      designation: 'Creative Director',
      phone: '+1-555-0104',
      department: 'Creative'
    }
  })

  console.log('✅ Users created')

  // Create clients
  const clients = []
  const clientData = [
    { name: 'TechCorp Solutions', email: 'contact@techcorp.com', company: 'TechCorp Solutions', phone: '+1-555-1001' },
    { name: 'Fashion Forward', email: 'hello@fashionforward.com', company: 'Fashion Forward Inc.', phone: '+1-555-1002' },
    { name: 'Green Energy Co.', email: 'info@greenenergy.com', company: 'Green Energy Co.', phone: '+1-555-1003' },
    { name: 'Foodie Delights', email: 'marketing@foodiedelights.com', company: 'Foodie Delights', phone: '+1-555-1004' },
    { name: 'SportsMax', email: 'team@sportsmax.com', company: 'SportsMax Media', phone: '+1-555-1005' },
    { name: 'Beauty Brand', email: 'contact@beautybrand.com', company: 'Beauty Brand LLC', phone: '+1-555-1006' },
    { name: 'AutoDrive', email: 'marketing@autodrive.com', company: 'AutoDrive Motors', phone: '+1-555-1007' },
    { name: 'EduTech', email: 'hello@edutech.com', company: 'EduTech Solutions', phone: '+1-555-1008' },
    { name: 'HealthFirst', email: 'info@healthfirst.com', company: 'HealthFirst Medical', phone: '+1-555-1009' },
    { name: 'TravelWise', email: 'contact@travelwise.com', company: 'TravelWise Adventures', phone: '+1-555-1010' }
  ]

  for (const clientInfo of clientData) {
    const client = await prisma.client.upsert({
      where: { name: clientInfo.name },
      update: {},
      create: clientInfo
    })
    clients.push(client)
  }

  console.log('✅ Clients created')

  // Create projects
  const projects = []
  for (let i = 0; i < 5; i++) {
    const project = await prisma.project.create({
      data: {
        name: `Project ${i + 1}`,
        description: `Description for Project ${i + 1}`,
        clientId: clients[i].id,
        status: 'active',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31)
      }
    })
    projects.push(project)
  }

  console.log('✅ Projects created')

  // Create tasks
  const taskData = [
    { title: 'Script writing for TechCorp ad', description: 'Create engaging script for new product launch', priority: 'high', projectId: projects[0].id, assigneeId: alex.id, dueDate: new Date(2024, 11, 15) },
    { title: 'Video editing for Fashion Forward', description: 'Edit promotional video for spring collection', priority: 'medium', projectId: projects[1].id, assigneeId: sarah.id, dueDate: new Date(2024, 11, 20) },
    { title: 'Storyboard creation', description: 'Create storyboard for Green Energy campaign', priority: 'urgent', projectId: projects[2].id, assigneeId: mike.id, dueDate: new Date(2024, 11, 10) },
    { title: 'Client meeting preparation', description: 'Prepare presentation for Foodie Delights', priority: 'medium', assigneeId: mia.id, dueDate: new Date(2024, 11, 12) },
    { title: 'Social media content creation', description: 'Create content for SportsMax social channels', priority: 'low', projectId: projects[4].id, assigneeId: alex.id, dueDate: new Date(2024, 11, 25) },
    { title: 'Color grading for Beauty Brand', description: 'Color grade product showcase video', priority: 'high', assigneeId: sarah.id, dueDate: new Date(2024, 11, 18) },
    { title: 'Motion graphics design', description: 'Create animated graphics for AutoDrive', priority: 'medium', projectId: projects[6].id, assigneeId: mike.id, dueDate: new Date(2024, 11, 22) },
    { title: 'Voice-over recording', description: 'Record voice-over for EduTech tutorial', priority: 'low', projectId: projects[7].id, assigneeId: alex.id, dueDate: new Date(2024, 11, 30) },
    { title: 'Client feedback review', description: 'Review and implement HealthFirst feedback', priority: 'urgent', assigneeId: sarah.id, dueDate: new Date(2024, 11, 8) },
    { title: 'Final delivery preparation', description: 'Prepare final deliverables for TravelWise', priority: 'high', projectId: projects[9].id, assigneeId: mike.id, dueDate: new Date(2024, 11, 28) }
  ]

  for (const taskInfo of taskData) {
    await prisma.task.create({
      data: {
        ...taskInfo,
        creatorId: mia.id,
        status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as any
      }
    })
  }

  console.log('✅ Tasks created')

  // Create shoots
  const shootData = [
    { title: 'TechCorp Product Launch', description: 'Main product launch video shoot', clientId: clients[0].id, startDate: new Date(2024, 11, 15), endDate: new Date(2024, 11, 16), budget: 15000 },
    { title: 'Fashion Forward Spring Collection', description: 'Spring collection photoshoot', clientId: clients[1].id, startDate: new Date(2024, 11, 20), endDate: new Date(2024, 11, 21), budget: 12000 },
    { title: 'Green Energy Documentary', description: 'Documentary about sustainable energy', clientId: clients[2].id, startDate: new Date(2024, 11, 25), endDate: new Date(2024, 11, 27), budget: 25000 },
    { title: 'Foodie Delights Commercial', description: 'Commercial for new restaurant chain', clientId: clients[3].id, startDate: new Date(2024, 11, 30), endDate: new Date(2024, 11, 31), budget: 18000 },
    { title: 'SportsMax Training Video', description: 'Training video for athletes', clientId: clients[4].id, startDate: new Date(2025, 0, 5), endDate: new Date(2025, 0, 6), budget: 20000 },
    { title: 'Beauty Brand Tutorial', description: 'Makeup tutorial series', clientId: clients[5].id, startDate: new Date(2025, 0, 10), endDate: new Date(2025, 0, 12), budget: 16000 }
  ]

  for (const shootInfo of shootData) {
    await prisma.shoot.create({
      data: shootInfo
    })
  }

  console.log('✅ Shoots created')

  // Create leads
  const leadData = [
    { name: 'John Smith', email: 'john@newclient.com', company: 'New Client Inc.', source: 'website', value: 50000, status: 'new' },
    { name: 'Jane Doe', email: 'jane@startup.com', company: 'Startup Co.', source: 'referral', value: 30000, status: 'contacted' },
    { name: 'Bob Wilson', email: 'bob@enterprise.com', company: 'Enterprise Solutions', source: 'social', value: 100000, status: 'qualified' },
    { name: 'Alice Brown', email: 'alice@local.com', company: 'Local Business', source: 'website', value: 15000, status: 'rejected', reason: 'Budget too low' },
    { name: 'Charlie Davis', email: 'charlie@tech.com', company: 'Tech Startup', source: 'referral', value: 75000, status: 'converted', convertedAt: new Date() },
    { name: 'Diana Lee', email: 'diana@fashion.com', company: 'Fashion House', source: 'social', value: 40000, status: 'new' },
    { name: 'Eve Martinez', email: 'eve@health.com', company: 'Health Clinic', source: 'website', value: 25000, status: 'contacted' },
    { name: 'Frank Taylor', email: 'frank@finance.com', company: 'Finance Corp', source: 'referral', value: 80000, status: 'qualified' },
    { name: 'Grace Kim', email: 'grace@retail.com', company: 'Retail Chain', source: 'social', value: 60000, status: 'new' },
    { name: 'Henry Clark', email: 'henry@education.com', company: 'Education Group', source: 'website', value: 35000, status: 'contacted' }
  ]

  for (const leadInfo of leadData) {
    await prisma.lead.create({
      data: {
        ...leadInfo,
        creatorId: mia.id,
        assigneeId: Math.random() > 0.5 ? alex.id : mike.id
      }
    })
  }

  console.log('✅ Leads created')

  // Create invoices
  const invoiceData = [
    { clientId: clients[0].id, invoiceNumber: 'INV-2024-001', amount: 15000, status: 'paid', dueDate: new Date(2024, 10, 15), paidDate: new Date(2024, 10, 10) },
    { clientId: clients[1].id, invoiceNumber: 'INV-2024-002', amount: 12000, status: 'paid', dueDate: new Date(2024, 10, 20), paidDate: new Date(2024, 10, 18) },
    { clientId: clients[2].id, invoiceNumber: 'INV-2024-003', amount: 25000, status: 'sent', dueDate: new Date(2024, 11, 5) },
    { clientId: clients[3].id, invoiceNumber: 'INV-2024-004', amount: 18000, status: 'overdue', dueDate: new Date(2024, 10, 30) },
    { clientId: clients[4].id, invoiceNumber: 'INV-2024-005', amount: 20000, status: 'paid', dueDate: new Date(2024, 11, 10), paidDate: new Date(2024, 11, 8) },
    { clientId: clients[5].id, invoiceNumber: 'INV-2024-006', amount: 16000, status: 'sent', dueDate: new Date(2024, 11, 15) },
    { clientId: clients[6].id, invoiceNumber: 'INV-2024-007', amount: 22000, status: 'draft', dueDate: new Date(2024, 11, 20) },
    { clientId: clients[7].id, invoiceNumber: 'INV-2024-008', amount: 14000, status: 'paid', dueDate: new Date(2024, 11, 25), paidDate: new Date(2024, 11, 22) }
  ]

  for (const invoiceInfo of invoiceData) {
    await prisma.invoice.create({
      data: invoiceInfo
    })
  }

  console.log('✅ Invoices created')

  // Create revenue data for the past 12 months
  const currentDate = new Date()
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - month, 1)
    const year = date.getFullYear()
    const monthNum = date.getMonth() + 1

    // Create revenue entries for random clients
    for (let i = 0; i < 3; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)]
      await prisma.revenue.create({
        data: {
          clientId: client.id,
          amount: Math.floor(Math.random() * 50000) + 10000,
          description: `Revenue for ${client.name} - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          month: monthNum,
          year: year
        }
      })
    }
  }

  console.log('✅ Revenue data created')

  // Create expense data for the past 12 months
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - month, 1)
    const year = date.getFullYear()
    const monthNum = date.getMonth() + 1

    const categories = ['equipment', 'travel', 'software', 'marketing', 'office']
    for (let i = 0; i < 5; i++) {
      await prisma.expense.create({
        data: {
          amount: Math.floor(Math.random() * 10000) + 1000,
          description: `${categories[Math.floor(Math.random() * categories.length)]} expense`,
          category: categories[Math.floor(Math.random() * categories.length)],
          month: monthNum,
          year: year
        }
      })
    }
  }

  console.log('✅ Expense data created')

  // Create scripts
  const scriptData = [
    { title: 'TechCorp Product Launch Script', content: 'Welcome to the future of technology...', clientId: clients[0].id },
    { title: 'Fashion Forward Spring Ad', content: 'Spring is here, and so is our new collection...', clientId: clients[1].id },
    { title: 'Green Energy Documentary', content: 'The future of energy is green...', clientId: clients[2].id },
    { title: 'Foodie Delights Commercial', content: 'Taste the difference...', clientId: clients[3].id },
    { title: 'SportsMax Training Video', content: 'Push your limits...', clientId: clients[4].id }
  ]

  for (const scriptInfo of scriptData) {
    const script = await prisma.script.create({
      data: {
        ...scriptInfo,
        creatorId: alex.id
      }
    })

    // Create initial version
    await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        version: 1,
        content: scriptInfo.content,
        changes: 'Initial version'
      }
    })
  }

  console.log('✅ Scripts created')

  // Create editing tasks
  const editingTaskData = [
    { title: 'Edit TechCorp Product Video', description: 'Main product launch video editing', assigneeId: sarah.id, status: 'editing', priority: 'high' },
    { title: 'Color Grade Fashion Forward', description: 'Color grading for spring collection', assigneeId: sarah.id, status: 'draft_ready', priority: 'medium' },
    { title: 'Motion Graphics for Green Energy', description: 'Create animated graphics', assigneeId: mike.id, status: 'in_review', priority: 'urgent' },
    { title: 'Sound Design for Foodie Delights', description: 'Audio post-production', assigneeId: sarah.id, status: 'approved', priority: 'low' },
    { title: 'Final Cut for SportsMax', description: 'Final editing and delivery', assigneeId: mike.id, status: 'editing', priority: 'high' }
  ]

  for (const taskInfo of editingTaskData) {
    await prisma.editingTask.create({
      data: taskInfo
    })
  }

  console.log('✅ Editing tasks created')

  // Create notifications
  const notificationData = [
    { userId: alex.id, title: 'New Task Assigned', message: 'You have been assigned a new task: Script writing for TechCorp ad', type: 'system' },
    { userId: sarah.id, title: 'Editing Task Ready', message: 'Fashion Forward video is ready for editing', type: 'approval' },
    { userId: mia.id, title: 'Urgent: Client Meeting', message: 'Client meeting with TechCorp scheduled for tomorrow', type: 'urgent' },
    { userId: mike.id, title: 'Project Update', message: 'Green Energy project needs your review', type: 'approval' },
    { userId: alex.id, title: 'Deadline Reminder', message: 'Script deadline approaching for Foodie Delights', type: 'urgent' }
  ]

  for (const notificationInfo of notificationData) {
    await prisma.notification.create({
      data: notificationInfo
    })
  }

  console.log('✅ Notifications created')

  // Create FAQ
  const faqData = [
    { question: 'How do I create a new task?', answer: 'Go to the Tasks section and click the "Create Task" button. Fill in the required details and assign it to a team member.', category: 'Tasks', order: 1 },
    { question: 'How do I track time on tasks?', answer: 'Click on a task and use the time tracking feature to start, pause, or stop timers.', category: 'Tasks', order: 2 },
    { question: 'How do I schedule a shoot?', answer: 'Go to the Shoot Planner and click "Schedule Shoot". Fill in the details including client, date, and team assignments.', category: 'Shoots', order: 1 },
    { question: 'How do I manage leads?', answer: 'Use the Leads Management section to track, assign, and update lead status throughout the sales process.', category: 'Leads', order: 1 },
    { question: 'How do I view revenue reports?', answer: 'Go to the Revenue section in the Executive dashboard to view detailed financial reports and trends.', category: 'Revenue', order: 1 }
  ]

  for (const faqInfo of faqData) {
    await prisma.fAQ.create({
      data: faqInfo
    })
  }

  console.log('✅ FAQ created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
