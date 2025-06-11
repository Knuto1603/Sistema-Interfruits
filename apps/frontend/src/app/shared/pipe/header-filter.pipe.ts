import { Pipe, PipeTransform } from '@angular/core';

import { valueFilter } from '../service/header.utils';

@Pipe({
	name: 'headerFilter',
	standalone: true,
})
export class HeaderFilterPipe implements PipeTransform {
	transform(value: string, searchString: string): boolean {
		return valueFilter(value, searchString);
	}
}
