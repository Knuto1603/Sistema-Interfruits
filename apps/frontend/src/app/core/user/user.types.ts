export interface User {
  id?: string;
  username?: string;
  password?: string;
  fullname?: string;
  roles: string[];
  rol?: number;
  rolName?: string;
  gender?: string;
  isActive?: boolean;
}
