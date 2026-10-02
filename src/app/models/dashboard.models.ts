export interface Role {
  _id?: string;
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  _id?: string;
  id: number;
  name: string;
  email: string;
  age: number;
  designation: string;
  role: Role | null;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMetadata {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ProfileListResponse extends ApiResponse<Profile[]> {
  pagination: PaginationMetadata;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponseData {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
