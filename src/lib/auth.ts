const USERS_KEY = "todo-users";
const SESSION_KEY = "todo-session";
const GUEST_SESSION_KEY = "todo-guest-session";

export interface User {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  isGuest?: boolean;
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
  sessionStorage.removeItem(GUEST_SESSION_KEY);
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
    name: email.split("@")[0],
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);

  const session: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
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

  const session: User = {
    id: match.id,
    email: match.email,
    name: match.name || match.email.split("@")[0],
    bio: match.bio,
    avatar: match.avatar,
    createdAt: match.createdAt || new Date().toISOString(),
  };
  writeSession(session);
  return session;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, "name" | "bio" | "avatar">>,
): Promise<User> {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("User not found");
  }

  const updatedUser: StoredUser = {
    ...users[index],
    ...updates,
  };

  users[index] = updatedUser;
  writeUsers(users);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...sessionUser } = updatedUser;
  writeSession(sessionUser);
  return sessionUser;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("User not found");
  }

  const currentHash = await hashPassword(currentPassword);
  if (users[index].passwordHash !== currentHash) {
    throw new Error("Incorrect current password");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  users[index].passwordHash = await hashPassword(newPassword);
  writeUsers(users);
}

export function deleteAccount(userId: string): void {
  const users = readUsers();
  const filteredUsers = users.filter((u) => u.id !== userId);
  writeUsers(filteredUsers);
  localStorage.removeItem(`todo-tasks-${userId}`);
  logout();
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function continueAsGuest(): User {
  localStorage.removeItem(SESSION_KEY);
  const guest: User = { id: "guest", email: "", name: "Guest", isGuest: true };
  sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guest));
  return guest;
}

export function getGuestSession(): User | null {
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
