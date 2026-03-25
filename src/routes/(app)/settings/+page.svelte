<script lang="ts">
	import { updateSettings, type SettingsRequestDto, type SettingsResponseDto } from '$lib/api';
	import {
		Sun,
		Moon,
		Laptop,
		Check,
		AlertCircle,
		LogOut,
		ChevronRight,
		RefreshCcw
	} from '@lucide/svelte';

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
	}

	$effect(() => {
		settings.theme;
		settings.language;
		settings.marketingEmails;
		settings.securityAlerts;
		settings.reminderEmails;
		hasChanges;
		loading;
		hydrated;

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

<div class="w-full">
	<div class="flex w-full max-w-xl flex-col">
		<div class="flex items-center justify-end gap-2 text-sm font-medium">
			{#if loading}
				<div class="loading loading-xs loading-spinner text-primary"></div>
			{:else if error}
				<AlertCircle class="h-4 w-4 text-error" />
			{:else if hasChanges}
				<div class="loading loading-xs loading-spinner text-warning"></div>
			{:else}
				<Check class="h-4 w-4 text-success" />
			{/if}
		</div>

		{#if error}
			<div class="alert border border-error/20 alert-error shadow-sm">
				<AlertCircle class="h-5 w-5 shrink-0" />
				<span>{error}</span>
			</div>
		{/if}

		<section class="flex flex-col gap-4">
			<h2 class="px-1 text-lg font-semibold">Notifications</h2>

			<label
				class="group flex items-center justify-between gap-4 rounded-xl border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300 active:bg-base-200"
			>
				<div class="flex flex-col gap-1">
					<span class="font-medium">Marketing emails</span>
					<span class="text-xs text-base-content/70">Receive product updates and helpful tips.</span
					>
				</div>
				<input
					type="checkbox"
					class="toggle h-6 w-10 toggle-primary"
					bind:checked={settings.marketingEmails}
				/>
			</label>

			<label
				class="group flex items-center justify-between gap-4 rounded-xl border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300 active:bg-base-200"
			>
				<div class="flex flex-col gap-1">
					<span class="font-medium">Security alerts</span>
					<span class="text-xs text-base-content/70"
						>Get notified when important security events occur.</span
					>
				</div>
				<input
					type="checkbox"
					class="toggle h-6 w-10 toggle-primary"
					bind:checked={settings.securityAlerts}
				/>
			</label>

			<label
				class="group flex items-center justify-between gap-4 rounded-xl border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300 active:bg-base-200"
			>
				<div class="flex flex-col gap-1">
					<span class="font-medium">Reminder emails</span>
					<span class="text-xs text-base-content/70"
						>Get gentle reminders to keep your routine on track.</span
					>
				</div>
				<input
					type="checkbox"
					class="toggle h-6 w-10 toggle-primary"
					bind:checked={settings.reminderEmails}
				/>
			</label>
		</section>

		<section class="flex flex-col gap-4 pt-6">
			<h2 class="px-1 text-lg font-semibold">App preferences</h2>

			<div class="flex flex-col gap-3">
				<div class="rounded-xl border border-base-200 bg-base-100 p-4">
					<span class="text-xs font-medium tracking-wide text-base-content/60 uppercase">Theme</span
					>
					<div class="mt-3 grid grid-cols-3 gap-2">
						{#each AVAILABLE_THEMES as themeOption}
							<button
								onclick={() => setTheme(themeOption)}
								class="flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all {settings.theme ===
								themeOption
									? 'border-primary bg-primary/10 text-primary'
									: 'border-base-200 bg-base-100 text-base-content hover:bg-base-200'}"
							>
								{#if themeOption === 'LIGHT'}
									<Sun class="h-5 w-5" />
								{:else if themeOption === 'DARK'}
									<Moon class="h-5 w-5" />
								{:else}
									<Laptop class="h-5 w-5" />
								{/if}
								<span class="text-[10px] font-medium">{themeOption}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-4">
					<span class="text-xs font-medium tracking-wide text-base-content/60 uppercase"
						>Language</span
					>
					<div class="mt-1 font-medium">{settings.language}</div>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-4 pt-6">
			<h2 class="px-1 text-lg font-semibold">Account Security</h2>
			<div class="flex flex-col gap-3">
				<a
					href="/settings/mfa"
					class="hover:bg-primary-focus btn w-full justify-between rounded-xl border-none bg-primary px-4 py-3 font-medium shadow-sm btn-primary"
				>
					<span>Manage Multi-Factor Authentication</span>
					<ChevronRight class="h-5 w-5 opacity-70" />
				</a>
				<a
					href="/reset-password"
					class="hover:bg-primary-focus btn w-full justify-between rounded-xl border-none bg-primary px-4 py-3 font-medium shadow-sm btn-primary"
				>
					<span>Reset Password</span>
					<RefreshCcw class="h-5 w-5 opacity-70" />
				</a>
				<a
					href="/logout"
					class="hover:bg-error-focus btn w-full justify-between rounded-xl border-none px-4 py-3 font-medium shadow-sm btn-error"
				>
					<span>Logout</span>
					<LogOut class="h-5 w-5 opacity-70" />
				</a>
			</div>
		</section>
	</div>
</div>
