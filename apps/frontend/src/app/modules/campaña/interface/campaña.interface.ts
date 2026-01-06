import { Pagination } from '@shared/interface/pagination.interface';

export interface Campanha{
  id: string;
  nombre: string;
  descripcion: string;
  periodoId?: number;
  frutaId?: number;
  isActive?: boolean;
}

export interface CampanhasResponse {
  items: Campanha[];
  pagination: Pagination;
}

export interface CampanhaShared {
  id?: string;
  nombre: string;
  descripcion: string;
  periodoAlias: string;
  frutaAlias: string;
}
