const USERS_KEY = "todo-users";
const SESSION_KEY = "todo-session";

export interface User {
  id: string;
  email: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function writeSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export async function signup(email: string, password: string): Promise<User> {
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("Email already registered");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash: await hashPassword(password),
  };
  writeUsers([...users, user]);

  const session: User = { id: user.id, email: user.email };
  writeSession(session);
  return session;
}

export async function login(email: string, password: string): Promise<User> {
  const users = readUsers();
  const passwordHash = await hashPassword(password);
  const match = users.find(
    (u) => u.email === email && u.passwordHash === passwordHash,
  );
  if (!match) {
    throw new Error("Invalid email or password");
  }

  const session: User = { id: match.id, email: match.email };
  writeSession(session);
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
