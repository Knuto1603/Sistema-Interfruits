export const defaultYears = (): number[] => {
	const aniosList: number[] = [];
	const anio: number = new Date().getFullYear();
	for (let i: number = anio; i >= 2013; i--) {
		aniosList.push(i);
	}

	return aniosList;
};

export const nameMonths = (
	format: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined = 'long',
	locale?: string
): string[] => {
	return Array.from(Array(12).keys(), (key) =>
		Intl.DateTimeFormat(locale, {
			month: format,
		}).format(new Date(0, key))
	);
};
