const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export interface SendOtpRequest {
  email: string
  type: 'login' | 'signup'
  role?: 'candidate' | 'recruiter'
}

export interface VerifyOtpRequest {
  email: string
  otp: string
  type: 'login' | 'signup'
}

export interface RecruiterSignupData {
  email: string
  fullName: string
  companyName: string
  companyWebsite?: string
  industry?: string
  companySize?: string
  jobTitle?: string
  phoneNumber?: string
}

export interface User {
  id: string
  email: string
  fullName: string | null
  role: 'candidate' | 'recruiter' | 'admin'
  phoneNumber: string | null
  profilePicture: string | null
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export async function sendOtp (data: SendOtpRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return response.json()
}

export async function verifyOtp (data: VerifyOtpRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return response.json()
}

export async function recruiterSignup (
  data: RecruiterSignupData
): Promise<{ success: boolean; message: string; userId?: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/recruiter/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return response.json()
}

export async function logout (
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  })

  return response.json()
}

export async function getMe (
  token: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  })

  return response.json()
}

export const authApi = {
  sendOtp,
  verifyOtp,
  recruiterSignup,
  logout,
  getMe
}
