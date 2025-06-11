import { Pipe, PipeTransform } from '@angular/core';

import { ParametroShared } from '../interface/parametro.interface';

@Pipe({
	name: 'parametroShared',
	standalone: true,
})
export class ParametroSharedPipe implements PipeTransform {
	transform(values: Array<ParametroShared>, parentAlias: string): Array<ParametroShared> {
		return values.filter((v) => v.parentAlias === parentAlias);
	}
}
