import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Load from localStorage on init
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        this.state = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem("auth");
      }
    }
  }

  getState(): AuthState {
    return this.state;
  }

  setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    localStorage.setItem("auth", JSON.stringify(this.state));
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  login(user: User, token: string) {
    this.setState({ user, token });
  }

  logout() {
    this.setState({ user: null, token: null });
    localStorage.removeItem("auth");
  }

  isAuthenticated(): boolean {
    return !!this.state.user;
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }
}

export const authManager = new AuthManager();
