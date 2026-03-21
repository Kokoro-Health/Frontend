import type { ProfileResponseDto } from '$lib/api';
import { getLocale } from './dateUtil';

export function toAmPmTime(instantStr: string, user: ProfileResponseDto): string {
	const date = new Date(instantStr);

	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid instant: ${instantStr}`);
	}

	return new Intl.DateTimeFormat(getLocale(user), {
		timeZone: user.timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(date);
}
