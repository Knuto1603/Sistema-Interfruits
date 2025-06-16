import { Pagination } from '@shared/interface/pagination.interface';

export interface Role {
	id?: number;
  name?: string;
	alias?: string;
	isActive: boolean;
}

export interface RolesResponse {
	items: Role[];
	pagination: Pagination;
}

export interface RoleShared {
  id: string;
  name: string;
}
