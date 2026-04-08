import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { browser } from '$app/environment';

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
	if (!browser) return;

	const styleMap = {
		light: ImpactStyle.Light,
		medium: ImpactStyle.Medium,
		heavy: ImpactStyle.Heavy
	};

	try {
		await Haptics.impact({ style: styleMap[style] });
	} catch {
		if ('vibrate' in navigator) {
			navigator.vibrate(style === 'light' ? 5 : style === 'heavy' ? 20 : 10);
		}
	}
}

export async function hapticSelection() {
	if (!browser) return;

	try {
		await Haptics.selectionChanged();
	} catch {
		if ('vibrate' in navigator) {
			navigator.vibrate(5);
		}
	}
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
	if (!browser) return;

	const notificationTypeMap: Record<'success' | 'warning' | 'error', NotificationType> = {
		success: NotificationType.Success,
		warning: NotificationType.Warning,
		error: NotificationType.Error
	};

	try {
		await Haptics.notification({ type: notificationTypeMap[type] });
	} catch {
		if ('vibrate' in navigator) {
			navigator.vibrate(
				type === 'success' ? [10, 50, 10] : type === 'warning' ? [20, 100] : [50, 50, 50]
			);
		}
	}
}
