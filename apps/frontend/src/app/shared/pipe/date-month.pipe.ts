import { Pipe, PipeTransform } from '@angular/core';

import { nameMonths } from '../service/date.utils';

@Pipe({
	name: 'dateMonth',
	standalone: true,
})
export class DateMonthPipe implements PipeTransform {
	private months: string[] = nameMonths();

	transform(value: number): string {
		return this.months[value - 1] || 'error';
	}
}
