// Admin authentication utility
export const ADMIN_CREDENTIALS = {
  email: "admin@eventghor.com",
  password: "admin123",
}

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminEmail", email)
    }
    return true
  }
  return false
}

export function adminLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminEmail")
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminAuth") === "true"
  }
  return false
}

export function getAdminEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminEmail")
  }
  return null
}
