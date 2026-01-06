import { Pagination } from '@shared/interface/pagination.interface';

export interface Periodo{
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  id: string;
  isActive?: boolean;
}

export interface PeriodoResponse {
  items: Periodo[];
  pagination: Pagination;
}

export interface PeriodoShared {
  id?: string;
  nombre: string;
  codigo: string;
}
