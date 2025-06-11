import { Pagination } from '@shared/interface/pagination.interface';

export interface Parametro {
	id: string;
	name: string;
	alias: string;
	value?: number;
	parentId?: number;
	parentName?: string;
	isActive?: boolean;
}

export interface ParametrosResponse {
	items: Parametro[];
	pagination: Pagination;
}
export interface ParametroParentResponse {
	id: string;
	name: string;
}

export interface ParametroShared {
	id?: string;
	name: string;
	alias: string;
	parentAlias: string;
}
