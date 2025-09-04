# GOAT Media Backend Manual

## Overview

This document provides comprehensive information about the GOAT Media dual-dashboard SaaS backend implementation. The backend is built using Next.js API routes, Prisma ORM, and Supabase PostgreSQL database.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Supabase Setup](#supabase-setup)
3. [API Endpoints](#api-endpoints)
4. [Insights Queries](#insights-queries)
5. [Seeding Instructions](#seeding-instructions)
6. [Authentication System](#authentication-system)
7. [Adding Authentication & RBAC](#adding-authentication--rbac)

## Database Schema

### Core Tables

#### Users
- **Purpose**: Store user profiles and role information
- **Key Fields**: `id`, `email`, `name`, `role`, `designation`
- **Roles**: `employee`, `executive`

#### Tasks
- **Purpose**: Task management with time tracking
- **Key Fields**: `title`, `description`, `status`, `priority`, `assigneeId`, `dueDate`
- **Statuses**: `pending`, `in_progress`, `completed`, `overdue`
- **Priorities**: `low`, `medium`, `high`, `urgent`

#### Shoots
- **Purpose**: Video shoot scheduling and management
- **Key Fields**: `title`, `clientId`, `startDate`, `endDate`, `budget`, `status`

#### Leads
- **Purpose**: Sales lead management
- **Key Fields**: `name`, `email`, `company`, `status`, `value`, `assigneeId`
- **Statuses**: `new`, `contacted`, `qualified`, `rejected`, `converted`

#### Revenue & Expenses
- **Purpose**: Financial tracking
- **Key Fields**: `amount`, `description`, `month`, `year`, `clientId`

#### Scripts & Script Versions
- **Purpose**: Content creation and version control
- **Key Fields**: `title`, `content`, `creatorId`, `version`

### Relationships

```mermaid
erDiagram
    User ||--o{ Task : "assigns/creates"
    User ||--o{ Lead : "assigns/creates"
    User ||--o{ ShootAssignment : "assigned to"
    Client ||--o{ Project : "has"
    Client ||--o{ Shoot : "books"
    Client ||--o{ Invoice : "receives"
    Project ||--o{ Task : "contains"
    Shoot ||--o{ ShootAssignment : "has"
    Script ||--o{ ScriptVersion : "has versions"
    EditingTask ||--o{ Comment : "has comments"
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# JWT Secret (for dummy auth)
JWT_SECRET="your-secret-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### 4. Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio
```

## API Endpoints

### Authentication

#### POST `/api/auth/login`
**Purpose**: Dummy login system
**Request Body**:
```json
{
  "email": "alex.employee@goat.media",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_1",
    "email": "alex.employee@goat.media",
    "name": "Alex Johnson",
    "role": "employee",
    "designation": "Content Creator"
  },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/verify`
**Purpose**: Verify JWT token
**Request Body**:
```json
{
  "token": "jwt-token-here"
}
```

### Tasks

#### GET `/api/tasks`
**Query Parameters**:
- `assigneeId`: Filter by assignee
- `status`: Filter by status
- `priority`: Filter by priority

#### POST `/api/tasks`
**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "assigneeId": "user_1",
  "dueDate": "2024-12-31T23:59:59Z",
  "estimatedHours": 8
}
```

#### PUT `/api/tasks/[id]`
**Purpose**: Update task details

#### PUT `/api/tasks/[id]/status`
**Purpose**: Update task status
**Request Body**:
```json
{
  "status": "completed"
}
```

#### PUT `/api/tasks/[id]/priority`
**Purpose**: Update task priority
**Request Body**:
```json
{
  "priority": "urgent"
}
```

### Shoots

#### GET `/api/shoots`
**Query Parameters**:
- `clientId`: Filter by client
- `status`: Filter by status
- `startDate` & `endDate`: Date range filter

#### POST `/api/shoots`
**Request Body**:
```json
{
  "title": "Product Launch Shoot",
  "description": "Main product launch video",
  "clientId": "client_1",
  "startDate": "2024-12-15T09:00:00Z",
  "endDate": "2024-12-15T17:00:00Z",
  "budget": 15000
}
```

#### POST `/api/shoots/[id]/assign-team`
**Purpose**: Assign team members to shoot
**Request Body**:
```json
{
  "assignments": [
    {
      "userId": "user_1",
      "role": "director"
    },
    {
      "userId": "user_2",
      "role": "camera"
    }
  ]
}
```

### Leads

#### GET `/api/leads`
**Query Parameters**:
- `status`: Filter by status
- `assigneeId`: Filter by assignee
- `source`: Filter by source

#### POST `/api/leads`
**Request Body**:
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "company": "Tech Corp",
  "source": "website",
  "value": 50000,
  "notes": "Interested in video production"
}
```

#### PUT `/api/leads/[id]/status`
**Purpose**: Update lead status
**Request Body**:
```json
{
  "status": "qualified",
  "reason": "Budget approved"
}
```

### Revenue & Invoices

#### GET `/api/revenue/overview`
**Query Parameters**:
- `year`: Filter by year (default: current year)
- `month`: Filter by month

**Response**:
```json
{
  "totalRevenue": 150000,
  "totalExpenses": 75000,
  "profit": 75000,
  "trends": [
    {
      "month": 1,
      "revenue": 12000,
      "expenses": 6000,
      "profit": 6000
    }
  ]
}
```

#### GET `/api/revenue/by-client`
**Purpose**: Revenue breakdown by client

#### GET `/api/revenue/trends`
**Purpose**: Year-over-year growth analysis

#### GET `/api/invoices`
**Query Parameters**:
- `clientId`: Filter by client
- `status`: Filter by status

### Scripts

#### GET `/api/scripts`
**Query Parameters**:
- `clientId`: Filter by client
- `projectId`: Filter by project

#### POST `/api/scripts`
**Request Body**:
```json
{
  "title": "Product Launch Script",
  "content": "Welcome to the future...",
  "clientId": "client_1"
}
```

#### POST `/api/scripts/[id]/versions`
**Purpose**: Create new script version
**Request Body**:
```json
{
  "content": "Updated script content",
  "changes": "Added new dialogue"
}
```

### Notifications

#### GET `/api/notifications`
**Query Parameters**:
- `userId`: Filter by user
- `type`: Filter by type (`urgent`, `approval`, `system`)
- `isRead`: Filter by read status

#### POST `/api/notifications`
**Request Body**:
```json
{
  "userId": "user_1",
  "title": "New Task Assigned",
  "message": "You have a new task",
  "type": "system",
  "actionUrl": "/tasks/123"
}
```

#### PUT `/api/notifications/[id]/read`
**Purpose**: Mark notification as read/unread
**Request Body**:
```json
{
  "isRead": true
}
```

### Insights

#### GET `/api/insights`
**Purpose**: Get comprehensive analytics data
**Query Parameters**:
- `year`: Filter by year
- `month`: Filter by month

**Response**:
```json
{
  "weeklyTaskCompletion": {
    "total": 25,
    "completed": 18,
    "inProgress": 5,
    "pending": 2,
    "overdue": 0
  },
  "revenueByClient": [
    {
      "clientId": "client_1",
      "clientName": "TechCorp",
      "revenue": 50000
    }
  ],
  "revenueGrowth": 15.5,
  "profitVsExpense": {
    "revenue": 150000,
    "expenses": 75000,
    "profit": 75000
  },
  "teamWorkload": [
    {
      "userId": "user_1",
      "userName": "Alex Johnson",
      "taskCount": 8
    }
  ],
  "productivityScore": [
    {
      "userId": "user_1",
      "userName": "Alex Johnson",
      "completedTasks": 12
    }
  ],
  "leadConversionRate": 25.5
}
```

## Insights Queries

### Weekly Task Completion
```sql
SELECT 
  status,
  COUNT(*) as count
FROM tasks 
WHERE created_at >= DATE_TRUNC('week', NOW())
GROUP BY status;
```

### Revenue by Client
```sql
SELECT 
  c.name as client_name,
  SUM(r.amount) as total_revenue
FROM revenue r
JOIN clients c ON r.client_id = c.id
WHERE r.year = 2024
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
```

### Team Workload
```sql
SELECT 
  u.name,
  COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.assignee_id 
  AND t.status IN ('pending', 'in_progress')
GROUP BY u.id, u.name
ORDER BY task_count DESC;
```

### Lead Conversion Rate
```sql
SELECT 
  (COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / COUNT(*)) as conversion_rate
FROM leads;
```

## Seeding Instructions

### 1. Run Seed Script

```bash
npm run db:seed
```

### 2. Seed Data Includes

- **Users**: 4 demo users (Alex, Mia, Sarah, Mike)
- **Clients**: 10 diverse clients across industries
- **Projects**: 5 active projects
- **Tasks**: 10 tasks with various statuses and priorities
- **Shoots**: 6 scheduled shoots
- **Leads**: 10 leads in different stages
- **Invoices**: 8 invoices with various statuses
- **Revenue**: 12 months of revenue data
- **Expenses**: 12 months of expense data
- **Scripts**: 5 scripts with version history
- **Editing Tasks**: 5 editing tasks
- **Notifications**: 5 sample notifications
- **FAQ**: 5 frequently asked questions

### 3. Demo Login Credentials

**Employee Account**:
- Email: `alex.employee@goat.media`
- Password: `password123`

**Executive Account**:
- Email: `mia.exec@goat.media`
- Password: `password123`

## Authentication System

### Current Implementation (Dummy)

The current system uses hardcoded credentials for testing:

```typescript
// lib/auth.ts
export const DUMMY_USERS = {
  'alex.employee@goat.media': {
    id: 'user_1',
    email: 'alex.employee@goat.media',
    name: 'Alex Johnson',
    role: 'employee',
    designation: 'Content Creator',
    password: 'password123'
  },
  'mia.exec@goat.media': {
    id: 'user_2',
    email: 'mia.exec@goat.media',
    name: 'Mia Rodriguez',
    role: 'executive',
    designation: 'Executive Director',
    password: 'password123'
  }
}
```

### JWT Token Structure

```typescript
interface UserPayload {
  id: string
  email: string
  name: string
  role: 'employee' | 'executive'
  designation: string
}
```

## Adding Authentication & RBAC

### 1. Database Authentication

To implement real authentication:

1. **Add password hashing**:
```typescript
import bcrypt from 'bcryptjs'

// Hash password before storing
const hashedPassword = await bcrypt.hash(password, 12)

// Verify password on login
const isValid = await bcrypt.compare(password, user.hashedPassword)
```

2. **Update User model**:
```prisma
model User {
  // ... existing fields
  hashedPassword String
  emailVerified  DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### 2. Role-Based Access Control

Create middleware for route protection:

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function withAuth(handler: Function, allowedRoles?: string[]) {
  return async (request: NextRequest, context: any) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Add user to request context
    request.user = user
    return handler(request, context)
  }
}
```

### 3. Protected Routes

```typescript
// app/api/tasks/route.ts
import { withAuth } from '@/middleware/auth'

export const GET = withAuth(async (request: NextRequest) => {
  // Handler logic here
  // request.user is available
}, ['employee', 'executive'])

export const POST = withAuth(async (request: NextRequest) => {
  // Handler logic here
}, ['executive']) // Only executives can create tasks
```

### 4. Supabase Auth Integration

For Supabase authentication:

```typescript
// lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side auth
export async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) return null
  
  return user
}
```

### 5. Database Row Level Security

Enable RLS in Supabase:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Employees can see tasks assigned to them
CREATE POLICY "Employees can view assigned tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = assignee_id);

-- Executives can see all tasks
CREATE POLICY "Executives can view all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'executive'
    )
  );
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Build for production
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL in .env.local
   - Check Supabase project status
   - Ensure database is not paused

2. **Prisma Client Error**
   - Run `npm run db:generate`
   - Check schema syntax
   - Verify database schema matches Prisma schema

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure user exists in DUMMY_USERS

4. **API Route Errors**
   - Check request body format
   - Verify required fields
   - Check database constraints

### Support

For additional support:
1. Check the Prisma documentation
2. Review Supabase documentation
3. Check Next.js API routes documentation
4. Review the seed data for examples

---

**Last Updated**: December 2024
**Version**: 1.0.0
