import type { ProfileResponseDto } from '$lib/api';

const PATTERN_MAP: Record<string, Intl.DateTimeFormatOptions> = {
	'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
	'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
	'MM/dd/yyyy': { month: '2-digit', day: '2-digit', year: 'numeric' },
	'dd-MM-yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
	'yyyy-MM-dd HH:mm': {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	},
	'yyyy-MM-dd HH:mm:ss': {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}
};

export function getLocale(user: ProfileResponseDto): string {
	return user.dateFormat.includes('-') ? 'de-CH' : 'en';
}

function getOptions(user: ProfileResponseDto): Intl.DateTimeFormatOptions {
	return (
		PATTERN_MAP[user.dateFormat] ?? {
			dateStyle: 'medium',
			timeStyle: 'medium'
		}
	);
}

export function formatInstant(instantStr: string, user: ProfileResponseDto): string {
	const date = new Date(instantStr);

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid instant: ${instantStr}`);
	}

	return new Intl.DateTimeFormat(getLocale(user), {
		timeZone: user.timezone,
		...getOptions(user)
	}).format(date);
}

export function toInstant(date: Date): string {
	return date.toISOString();
}

export function toDate(instantStr: string): Date {
	const date = new Date(instantStr);

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid instant: ${instantStr}`);
	}

	return date;
}

export function toIsoDate(date: Date): string {
	return toIsoDateFromString(date.toISOString());
}

export function toIsoDateFromString(str: string): string {
	return str.split('T')[0];
}
