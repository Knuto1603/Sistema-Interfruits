import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isNil, isPlainObject } from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class UtilsService {
	static buildParams(source: Record<string, any>): HttpParams {
		let target: HttpParams = new HttpParams();
		Object.keys(source).forEach((key: string) => {
			let value = source[key];
			if (isNil(value)) {
				return;
			}
			if (isPlainObject(value)) {
				value = JSON.stringify(value);
			} else {
				value = value.toString();
			}
			target = target.append(key, value);
		});

		return target;
	}
}
