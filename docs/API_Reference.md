# GOAT Media API Reference

## Overview

This document provides a comprehensive reference for all API endpoints in the GOAT Media backend system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except auth endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Authentication

#### POST `/api/auth/login`
Login with dummy credentials.

**Request Body:**
```json
{
  "email": "alex.employee@goat.media",
  "password": "password123"
}
```

**Response:**
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
Verify JWT token.

**Request Body:**
```json
{
  "token": "jwt-token-here"
}
```

### Tasks

#### GET `/api/tasks`
Get all tasks with optional filtering.

**Query Parameters:**
- `assigneeId` (string): Filter by assignee
- `status` (string): Filter by status (`pending`, `in_progress`, `completed`, `overdue`)
- `priority` (string): Filter by priority (`low`, `medium`, `high`, `urgent`)

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "projectId": "project_1",
  "assigneeId": "user_1",
  "dueDate": "2024-12-31T23:59:59Z",
  "estimatedHours": 8
}
```

#### GET `/api/tasks/[id]`
Get a specific task by ID.

#### PUT `/api/tasks/[id]`
Update a task.

#### DELETE `/api/tasks/[id]`
Delete a task.

#### PUT `/api/tasks/[id]/status`
Update task status.

**Request Body:**
```json
{
  "status": "completed"
}
```

#### PUT `/api/tasks/[id]/priority`
Update task priority.

**Request Body:**
```json
{
  "priority": "urgent"
}
```

#### GET `/api/tasks/[id]/time-logs`
Get time logs for a task.

#### POST `/api/tasks/[id]/time-logs`
Create a time log entry.

**Request Body:**
```json
{
  "userId": "user_1",
  "startTime": "2024-12-01T09:00:00Z",
  "endTime": "2024-12-01T17:00:00Z",
  "duration": 8,
  "notes": "Worked on script writing"
}
```

### Shoots

#### GET `/api/shoots`
Get all shoots with optional filtering.

**Query Parameters:**
- `clientId` (string): Filter by client
- `status` (string): Filter by status
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

#### POST `/api/shoots`
Create a new shoot.

**Request Body:**
```json
{
  "title": "Product Launch Shoot",
  "description": "Main product launch video",
  "clientId": "client_1",
  "startDate": "2024-12-15T09:00:00Z",
  "endDate": "2024-12-15T17:00:00Z",
  "budget": 15000,
  "location": "Studio A",
  "notes": "High priority shoot"
}
```

#### GET `/api/shoots/[id]`
Get a specific shoot by ID.

#### PUT `/api/shoots/[id]`
Update a shoot.

#### DELETE `/api/shoots/[id]`
Delete a shoot.

#### POST `/api/shoots/[id]/assign-team`
Assign team members to a shoot.

**Request Body:**
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
Get all leads with optional filtering.

**Query Parameters:**
- `status` (string): Filter by status (`new`, `contacted`, `qualified`, `rejected`, `converted`)
- `assigneeId` (string): Filter by assignee
- `source` (string): Filter by source

#### POST `/api/leads`
Create a new lead.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+1-555-0123",
  "company": "Tech Corp",
  "source": "website",
  "value": 50000,
  "notes": "Interested in video production",
  "assigneeId": "user_1"
}
```

#### GET `/api/leads/[id]`
Get a specific lead by ID.

#### PUT `/api/leads/[id]`
Update a lead.

#### DELETE `/api/leads/[id]`
Delete a lead.

#### PUT `/api/leads/[id]/status`
Update lead status.

**Request Body:**
```json
{
  "status": "qualified",
  "reason": "Budget approved"
}
```

#### POST `/api/leads/[id]/assign`
Assign a lead to a user.

**Request Body:**
```json
{
  "assigneeId": "user_1"
}
```

### Revenue & Invoices

#### GET `/api/revenue/overview`
Get revenue overview with trends.

**Query Parameters:**
- `year` (string): Filter by year (default: current year)
- `month` (string): Filter by month

#### GET `/api/revenue/by-client`
Get revenue breakdown by client.

**Query Parameters:**
- `year` (string): Filter by year

#### GET `/api/revenue/trends`
Get revenue trends and growth analysis.

**Query Parameters:**
- `years` (string): Number of years to analyze (default: 2)

#### GET `/api/invoices`
Get all invoices with optional filtering.

**Query Parameters:**
- `clientId` (string): Filter by client
- `status` (string): Filter by status (`draft`, `sent`, `paid`, `overdue`, `cancelled`)

#### POST `/api/invoices`
Create a new invoice.

**Request Body:**
```json
{
  "clientId": "client_1",
  "invoiceNumber": "INV-2024-001",
  "amount": 15000,
  "dueDate": "2024-12-31T23:59:59Z",
  "description": "Video production services"
}
```

### Scripts

#### GET `/api/scripts`
Get all scripts with optional filtering.

**Query Parameters:**
- `clientId` (string): Filter by client
- `projectId` (string): Filter by project

#### POST `/api/scripts`
Create a new script.

**Request Body:**
```json
{
  "title": "Product Launch Script",
  "content": "Welcome to the future of technology...",
  "clientId": "client_1",
  "projectId": "project_1"
}
```

#### GET `/api/scripts/[id]`
Get a specific script by ID.

#### PUT `/api/scripts/[id]`
Update a script.

#### DELETE `/api/scripts/[id]`
Delete a script (soft delete).

#### POST `/api/scripts/[id]/versions`
Create a new script version.

**Request Body:**
```json
{
  "content": "Updated script content",
  "changes": "Added new dialogue and improved flow"
}
```

### Editing Tasks

#### GET `/api/editing-tasks`
Get all editing tasks with optional filtering.

**Query Parameters:**
- `assigneeId` (string): Filter by assignee
- `status` (string): Filter by status (`editing`, `draft_ready`, `in_review`, `approved`)
- `priority` (string): Filter by priority

#### POST `/api/editing-tasks`
Create a new editing task.

**Request Body:**
```json
{
  "title": "Edit Product Video",
  "description": "Main product launch video editing",
  "shootId": "shoot_1",
  "assigneeId": "user_1",
  "priority": "high",
  "dueDate": "2024-12-20T17:00:00Z"
}
```

#### GET `/api/editing-tasks/[id]`
Get a specific editing task by ID.

#### PUT `/api/editing-tasks/[id]`
Update an editing task.

#### DELETE `/api/editing-tasks/[id]`
Delete an editing task.

#### GET `/api/editing-tasks/[id]/comments`
Get comments for an editing task.

#### POST `/api/editing-tasks/[id]/comments`
Add a comment to an editing task.

**Request Body:**
```json
{
  "content": "Great work on the color grading!",
  "userId": "user_1"
}
```

### Clients

#### GET `/api/clients`
Get all clients with optional search.

**Query Parameters:**
- `search` (string): Search by name, company, or email

#### POST `/api/clients`
Create a new client.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+1-555-0123",
  "company": "Tech Corp",
  "address": "123 Main St, City, State",
  "contactPerson": "John Smith"
}
```

#### GET `/api/clients/[id]`
Get a specific client by ID with related data.

#### PUT `/api/clients/[id]`
Update a client.

#### DELETE `/api/clients/[id]`
Delete a client.

### Projects

#### GET `/api/projects`
Get all projects with optional filtering.

**Query Parameters:**
- `clientId` (string): Filter by client
- `status` (string): Filter by status

#### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "Product Launch Campaign",
  "description": "Complete video campaign for new product",
  "clientId": "client_1",
  "status": "active",
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

#### GET `/api/projects/[id]`
Get a specific project by ID with tasks.

#### PUT `/api/projects/[id]`
Update a project.

#### DELETE `/api/projects/[id]`
Delete a project.

### Notifications

#### GET `/api/notifications`
Get all notifications with optional filtering.

**Query Parameters:**
- `userId` (string): Filter by user
- `type` (string): Filter by type (`urgent`, `approval`, `system`)
- `isRead` (boolean): Filter by read status

#### POST `/api/notifications`
Create a new notification.

**Request Body:**
```json
{
  "userId": "user_1",
  "title": "New Task Assigned",
  "message": "You have been assigned a new task",
  "type": "system",
  "actionUrl": "/tasks/123"
}
```

#### PUT `/api/notifications/[id]/read`
Mark notification as read/unread.

**Request Body:**
```json
{
  "isRead": true
}
```

### FAQ

#### GET `/api/faq`
Get all FAQ items with optional filtering.

**Query Parameters:**
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status

#### POST `/api/faq`
Create a new FAQ item.

**Request Body:**
```json
{
  "question": "How do I create a new task?",
  "answer": "Go to the Tasks section and click the Create Task button.",
  "category": "Tasks",
  "order": 1
}
```

#### GET `/api/faq/[id]`
Get a specific FAQ item by ID.

#### PUT `/api/faq/[id]`
Update an FAQ item.

#### DELETE `/api/faq/[id]`
Delete an FAQ item.

### AI Content Generation

#### POST `/api/ai/generate-script`
Generate a script using AI (mock implementation).

**Request Body:**
```json
{
  "prompt": "Create a commercial for a new smartphone",
  "type": "commercial",
  "duration": "60s",
  "tone": "professional",
  "targetAudience": "tech enthusiasts",
  "brandName": "TechCorp"
}
```

**Response:**
```json
{
  "success": true,
  "script": "[OPENING SHOT: Product close-up]\nNARRATOR: Introducing TechCorp...",
  "metadata": {
    "type": "commercial",
    "duration": "60s",
    "tone": "professional",
    "wordCount": 150,
    "estimatedDuration": "60s",
    "generatedAt": "2024-12-01T10:00:00Z"
  }
}
```

### Insights

#### GET `/api/insights`
Get comprehensive analytics and insights.

**Query Parameters:**
- `year` (string): Filter by year (default: current year)
- `month` (string): Filter by month (default: current month)

**Response:**
```json
{
  "weeklyTaskCompletion": {
    "total": 25,
    "completed": 18,
    "inProgress": 5,
    "pending": 2,
    "overdue": 0
  },
  "upcomingWorkload": [
    {
      "id": "task_1",
      "title": "Script Review",
      "dueDate": "2024-12-05T17:00:00Z",
      "assignee": {
        "id": "user_1",
        "name": "Alex Johnson"
      }
    }
  ],
  "revenueByClient": [
    {
      "clientId": "client_1",
      "clientName": "TechCorp",
      "company": "TechCorp Solutions",
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
      "designation": "Content Creator",
      "taskCount": 8
    }
  ],
  "productivityScore": [
    {
      "userId": "user_1",
      "userName": "Alex Johnson",
      "designation": "Content Creator",
      "completedTasks": 12
    }
  ],
  "leadConversionRate": 25.5
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting for API endpoints.

## Pagination

Most list endpoints support pagination through query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

## Filtering and Sorting

Most endpoints support filtering and sorting:
- Filter parameters are specific to each endpoint
- Sorting is typically by creation date (newest first)
- Use query parameters for filtering

## Data Validation

All endpoints use Zod schemas for request validation. Invalid data will return a 400 error with validation details.

---

**Last Updated**: December 2024
**Version**: 1.0.0
