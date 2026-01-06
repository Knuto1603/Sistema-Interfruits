import { Pagination } from '@shared/interface/pagination.interface';
import {Parametro} from "@modules/parametro/interface/parametro.interface";

export interface Productor {
  id: string;
  codigo: string;
  nombre: string;
  mtdAnastrepha: string;
  mtdCeratitis: string;
  clp: string;
  isActive?: boolean;
}

export interface ProductoresResponse {
  items: Productor[];
  pagination: Pagination;
}

export interface ProductorShared {
  id?: string;
  codigo: string;
  nombre: string;
  clp: string;
}

export interface LastProductorCode{
  lastCode: string;
}
