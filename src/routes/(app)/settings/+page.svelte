<script lang="ts">
	import { updateSettings, type SettingsRequestDto, type SettingsResponseDto } from '$api';
	import {
		Sun,
		Moon,
		Laptop,
		AlertCircle,
		LogOut,
		ChevronRight,
		RefreshCcw,
		Bell,
		Palette,
		User,
		Shield
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { hapticImpact } from '$util/haptics';

	let { data }: { data: { settings: SettingsResponseDto } } = $props();

	let savedSettings: SettingsRequestDto = $state({
		theme: 'LIGHT',
		language: 'ENGLISH',
		marketingEmails: false,
		securityAlerts: false,
		reminderEmails: false,
		timezone: '',
		dateFormat: ''
	});
	let settings: SettingsRequestDto = $state({
		theme: 'LIGHT',
		language: 'ENGLISH',
		marketingEmails: false,
		securityAlerts: false,
		reminderEmails: false,
		timezone: '',
		dateFormat: ''
	});
	let loading = $state(false);
	let error: string | null = $state(null);
	let hydrated = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	const AVAILABLE_THEMES = ['LIGHT', 'DARK', 'SYSTEM'] as const;

	$effect(() => {
		const source = data.settings as SettingsResponseDto;
		const incoming: SettingsRequestDto = {
			theme: source.theme as SettingsRequestDto['theme'],
			language: source.language as SettingsRequestDto['language'],
			marketingEmails: source.marketingEmails as SettingsRequestDto['marketingEmails'],
			securityAlerts: source.securityAlerts as SettingsRequestDto['securityAlerts'],
			reminderEmails: source.reminderEmails as SettingsRequestDto['reminderEmails'],
			timezone: source.timezone,
			dateFormat: source.dateFormat
		};
		savedSettings = { ...incoming };
		settings = { ...incoming };
		hydrated = true;
	});

	let hasChanges = $derived(
		settings.theme !== savedSettings.theme ||
			settings.language !== savedSettings.language ||
			settings.marketingEmails !== savedSettings.marketingEmails ||
			settings.securityAlerts !== savedSettings.securityAlerts ||
			settings.reminderEmails !== savedSettings.reminderEmails
	);

	async function saveSettings() {
		if (!hasChanges || loading) return;

		loading = true;
		error = null;
		const payload: SettingsRequestDto = { ...settings };
		const previousTheme = savedSettings.theme;

		try {
			const res = await updateSettings({ body: payload });
			if (res.error) {
				throw Error(res.error.message);
			}
			savedSettings = payload;

			if (payload.theme !== previousTheme) {
				const htmlElement = document.documentElement;
				if (payload.theme === 'SYSTEM') {
					htmlElement.removeAttribute('data-theme');
				} else {
					htmlElement.setAttribute('data-theme', 'kokoro-' + payload.theme.toLowerCase());
				}
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function setTheme(theme: (typeof AVAILABLE_THEMES)[number]) {
		settings.theme = theme;
		hapticImpact('light');
	}

	function toggleSetting(key: 'marketingEmails' | 'securityAlerts' | 'reminderEmails') {
		settings[key] = !settings[key];
		hapticImpact('light');
	}

	$effect(() => {
		if (!hydrated || !hasChanges || loading) return;

		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			saveSettings();
		}, 700);

		return () => {
			if (saveTimer) {
				clearTimeout(saveTimer);
				saveTimer = null;
			}
		};
	});
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Manage your account preferences and notifications." />
</svelte:head>

<div class="w-full pb-4">
	<div class="flex w-full max-w-xl flex-col gap-6">
		<div class="mb-2">
			<p class="text-sm font-medium text-base-content/60">Manage your preferences</p>
		</div>

		{#if error}
			<div class="alert border border-error/20 alert-error shadow-sm">
				<AlertCircle class="h-5 w-5 shrink-0" />
				<span>{error}</span>
			</div>
		{/if}

		<section class="flex flex-col gap-3">
			<div class="mb-1 flex items-center gap-2">
				<Bell class="h-4 w-4 text-base-content/50" />
				<h2 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Notifications
				</h2>
			</div>

			<button
				onclick={() => toggleSetting('reminderEmails')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 text-left transition-all active:scale-[0.98]"
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">Daily reminders</span>
					<span class="text-xs text-base-content/50">Get gentle nudges to log your energy.</span>
				</div>
				<input
					type="checkbox"
					class="toggle toggle-primary toggle-sm"
					checked={settings.reminderEmails}
					onchange={() => toggleSetting('reminderEmails')}
				/>
			</button>

			<button
				onclick={() => toggleSetting('marketingEmails')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 text-left transition-all active:scale-[0.98]"
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">Product updates</span>
					<span class="text-xs text-base-content/50">News about new features.</span>
				</div>
				<input
					type="checkbox"
					class="toggle toggle-primary toggle-sm"
					checked={settings.marketingEmails}
					onchange={() => toggleSetting('marketingEmails')}
				/>
			</button>

			<button
				onclick={() => toggleSetting('securityAlerts')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 text-left transition-all active:scale-[0.98]"
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">Security alerts</span>
					<span class="text-xs text-base-content/50">Important account notifications.</span>
				</div>
				<input
					type="checkbox"
					class="toggle toggle-primary toggle-sm"
					checked={settings.securityAlerts}
					onchange={() => toggleSetting('securityAlerts')}
				/>
			</button>
		</section>

		<section class="flex flex-col gap-3">
			<div class="mb-1 flex items-center gap-2">
				<Palette class="h-4 w-4 text-base-content/50" />
				<h2 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Appearance
				</h2>
			</div>

			<div class="rounded-xl border border-base-200/60 bg-base-100/60 p-4">
				<p class="mb-3 text-xs font-medium text-base-content/50">Theme</p>
				<div class="grid grid-cols-3 gap-2">
					{#each AVAILABLE_THEMES as themeOption (themeOption)}
						<button
							onclick={() => setTheme(themeOption)}
							class="flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all active:scale-95 {settings.theme ===
							themeOption
								? 'border-primary bg-primary/10 text-primary'
								: 'border-base-200/80 text-base-content hover:bg-base-200/30'}"
						>
							{#if themeOption === 'LIGHT'}
								<Sun class="h-5 w-5" />
							{:else if themeOption === 'DARK'}
								<Moon class="h-5 w-5" />
							{:else}
								<Laptop class="h-5 w-5" />
							{/if}
							<span class="text-xs font-medium">{themeOption}</span>
						</button>
					{/each}
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<div class="mb-1 flex items-center gap-2">
				<User class="h-4 w-4 text-base-content/50" />
				<h2 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">Account</h2>
			</div>

			<a
				href={resolve('/settings/profile')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 transition-all active:scale-[0.98]"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200">
						<User class="h-5 w-5 text-base-content/60" />
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-medium">Profile & Data</span>
						<span class="text-xs text-base-content/50">Manage your personal info</span>
					</div>
				</div>
				<ChevronRight class="h-5 w-5 text-base-content/30" />
			</a>

			<a
				href={resolve('/settings/mfa')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 transition-all active:scale-[0.98]"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200">
						<Shield class="h-5 w-5 text-base-content/60" />
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-medium">Security</span>
						<span class="text-xs text-base-content/50">2FA and passkeys</span>
					</div>
				</div>
				<ChevronRight class="h-5 w-5 text-base-content/30" />
			</a>

			<a
				href={resolve('/reset-password')}
				class="flex items-center justify-between rounded-xl border border-base-200/60 bg-base-100/60 p-4 transition-all active:scale-[0.98]"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200">
						<RefreshCcw class="h-5 w-5 text-base-content/60" />
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-medium">Password</span>
						<span class="text-xs text-base-content/50">Change your password</span>
					</div>
				</div>
				<ChevronRight class="h-5 w-5 text-base-content/30" />
			</a>
		</section>

		<a
			href={resolve('/logout')}
			class="mt-4 flex items-center justify-center gap-2 rounded-xl border border-error/20 bg-error/5 p-4 font-medium text-error transition-all active:scale-[0.98]"
		>
			<LogOut class="h-5 w-5" />
			<span>Sign out</span>
		</a>
	</div>
</div>
