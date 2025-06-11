export const valueFilter = (value: string, searchString: string): boolean => {
	const palabrasClave = searchString.toUpperCase().split(' ');
	let coincidencia = 0;
	const element = value.toUpperCase();
	palabrasClave.forEach((palabra) => {
		if (element.includes(palabra)) {
			coincidencia += 1;
		}
	});

	return coincidencia > 0;
};
