import raw from './catalog.json';
import type { Catalog } from '../domain/types';
export const catalog:Catalog=raw as unknown as Catalog;
export { questions } from './questions';
