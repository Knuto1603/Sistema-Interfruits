import { Pagination } from '@shared/interface/pagination.interface';

export interface User {
	id?: string;
	username?: string;
	password?: string;
	fullname?: string;
	roles?: string[];
	rol?: number;
	rolName?: string;
	gender?: string;
	isActive?: boolean;
}

export interface UsersResponse {
	items: User[];
	pagination: Pagination;
}
