// Simple client-side authentication utility (dummy implementation)
// In production, this would be replaced with proper authentication

const DUMMY_USER = {
  email: "admin@eventghor.com",
  password: "admin123",
  name: "Admin User",
}

export function login(email: string, password: string): boolean {
  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userName", DUMMY_USER.name)
    return true
  }
  return false
}

export function signup(name: string, email: string, password: string): boolean {
  // For now, just accept any signup and log them in
  localStorage.setItem("isAuthenticated", "true")
  localStorage.setItem("userEmail", email)
  localStorage.setItem("userName", name)
  return true
}

export function logout(): void {
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

export function getCurrentUser(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null
  const email = localStorage.getItem("userEmail")
  const name = localStorage.getItem("userName")
  if (email && name) {
    return { email, name }
  }
  return null
}
