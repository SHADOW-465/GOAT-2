import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Dummy users for authentication
export const DUMMY_USERS = {
  'alex.employee@goat.media': {
    id: 'user_1',
    email: 'alex.employee@goat.media',
    name: 'Alex Johnson',
    role: 'employee' as const,
    designation: 'Content Creator',
    password: 'password123'
  },
  'mia.exec@goat.media': {
    id: 'user_2',
    email: 'mia.exec@goat.media',
    name: 'Mia Rodriguez',
    role: 'executive' as const,
    designation: 'Executive Director',
    password: 'password123'
  }
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export type LoginRequest = z.infer<typeof loginSchema>

export interface UserPayload {
  id: string
  email: string
  name: string
  role: 'employee' | 'executive'
  designation: string
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export function authenticateUser(email: string, password: string): UserPayload | null {
  const user = DUMMY_USERS[email as keyof typeof DUMMY_USERS]
  
  if (!user || user.password !== password) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    designation: user.designation
  }
}
