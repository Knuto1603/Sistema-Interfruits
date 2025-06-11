import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	public set(key: string, value: string, time = 0) {
		const now = new Date();
		const item = {
			value,
			expiry: time > 0 ? now.getTime() + time * 1000 : 0,
		};

		localStorage.setItem(key, JSON.stringify(item));
		// localStorage.setItem(key, this.encrypt(value))
	}

	public get(key: string): string | null {
		const itemStr = localStorage.getItem(key);
		if (!itemStr) {
			return null;
		}
		const item = JSON.parse(itemStr);
		const now = new Date();
		if (item.expiry > 0 && now.getTime() > item.expiry) {
			localStorage.removeItem(key);

			return null;
		}

		return item.value;
		//return this.decrypt(data)
	}

	public remove(key: string) {
		localStorage.removeItem(key);
	}

	public clear() {
		localStorage.clear();
	}

	// private encrypt(txt: string): string {
	// 	return CryptoJS.AES.encrypt(txt, this.key).toString()
	// }
	//
	// private decrypt(txtToDecrypt: string) {
	// 	return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8)
	// }
}
