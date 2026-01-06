import { Pagination } from '@shared/interface/pagination.interface';

export interface Fruta{
  codigo: string;
  nombre: string;
  id: string;
  isActive?: boolean;
}

export interface FrutasResponse {
  items: Fruta[];
  pagination: Pagination;
}

export interface FrutaShared {
  id?: string;
  nombre: string;
  codigo: string;
}
