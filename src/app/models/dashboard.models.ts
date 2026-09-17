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
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}
