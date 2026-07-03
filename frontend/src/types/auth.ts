export interface User {
  id: number
  username: string
  created_at?: string
}

export interface LoginRequest {
  username: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string) => Promise<void>
  logout: () => void
}
