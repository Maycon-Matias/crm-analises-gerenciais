export type UserRole = "admin" | "user";

export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
