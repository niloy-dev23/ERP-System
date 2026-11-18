export type Role = "user" | "employee" | "admin";

export type Gender = "male" | "female" | "others";

export type TaskStatus = "todo" | "pending" | "archive" | "done";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errorMsg?: unknown;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  profilePic?: string;
  address?: string;
  gender?: Gender;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** The raw Mongoose document returned by user endpoints. */
export interface RawUser extends Omit<SafeUser, "id"> {
  _id?: string;
  id?: string;
  role?: Role;
  status?: boolean;
}

export interface UserRecord extends SafeUser {
  role?: Role;
  status?: boolean;
}

export interface AuthPayload {
  user: SafeUser;
  accessToken: string;
  token: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  token?: string;
  refreshToken: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TaskInput {
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

export interface UserInput {
  username?: string;
  email?: string;
  address?: string;
  profilePic?: string;
  gender?: Gender;
  role?: Role;
  status?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  gender: Gender;
  address?: string;
  profilePic?: string;
}
