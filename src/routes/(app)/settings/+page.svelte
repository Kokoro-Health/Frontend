<script lang="ts">
	import { updateSettings, type SettingsRequestDto, type SettingsResponseDto } from '$lib/api';

	let { data }: { data: { settings: SettingsResponseDto } } = $props();

	let savedSettings: SettingsRequestDto = $state({
		theme: 'LIGHT',
		language: 'ENGLISH',
		marketingEmails: false,
		securityAlerts: false,
		reminderEmails: false
	});
	let settings: SettingsRequestDto = $state({
		theme: 'LIGHT',
		language: 'ENGLISH',
		marketingEmails: false,
		securityAlerts: false,
		reminderEmails: false
	});
	let loading = $state(false);
	let error: string | null = $state(null);
	let hydrated = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const source = data.settings as SettingsResponseDto;
		const incoming: SettingsRequestDto = {
			theme: source.theme as SettingsRequestDto['theme'],
			language: source.language as SettingsRequestDto['language'],
			marketingEmails: source.marketingEmails as SettingsRequestDto['marketingEmails'],
			securityAlerts: source.securityAlerts as SettingsRequestDto['securityAlerts'],
			reminderEmails: source.reminderEmails as SettingsRequestDto['reminderEmails']
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

		await updateSettings({ body: payload })
			.then((res) => {
				if (res.error) {
					throw Error(res.error.message);
				}
				savedSettings = payload;
			})
			.catch((e: Error) => {
				error = e.message;
			})
			.finally(() => {
				loading = false;
			});
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

<div class="min-h-screen w-full pb-28">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-4">
		<div class="card rounded-box bg-base-200">
			<div class="card-body gap-2 p-5">
				<span class="text-2xl font-semibold">Settings</span>
				<span class="text-sm opacity-70">Manage your account preferences and notifications.</span>
			</div>
			<div class="flex items-center justify-end gap-3 text-sm opacity-80">
				{#if loading}
					<div class="loading loading-sm"></div>
				{/if}
				<span>{hasChanges ? 'Autosave pending...' : 'All changes saved.'}</span>
			</div>
		</div>
		{#if error}
			<div class="card rounded-box bg-error p-4 text-error-content">{error}</div>
		{/if}
		<div class="card rounded-box bg-base-200">
			<div class="card-body gap-5 p-5">
				<span class="text-lg font-semibold">Notifications</span>
				<label class="label cursor-pointer justify-between gap-4 rounded-box bg-base-100 p-4">
					<div class="flex flex-col gap-1">
						<span class="font-medium">Marketing emails</span>
						<span class="text-xs opacity-70">Receive product updates and helpful tips.</span>
					</div>
					<input type="checkbox" class="checkbox" bind:checked={settings.marketingEmails} />
				</label>
				<label class="label cursor-pointer justify-between gap-4 rounded-box bg-base-100 p-4">
					<div class="flex flex-col gap-1">
						<span class="font-medium">Security alerts</span>
						<span class="text-xs opacity-70"
							>Get notified when important security events occur.</span
						>
					</div>
					<input type="checkbox" class="checkbox" bind:checked={settings.securityAlerts} />
				</label>
				<label class="label cursor-pointer justify-between gap-4 rounded-box bg-base-100 p-4">
					<div class="flex flex-col gap-1">
						<span class="font-medium">Reminder emails</span>
						<span class="text-xs opacity-70"
							>Get gentle reminders to keep your routine on track.</span
						>
					</div>
					<input type="checkbox" class="checkbox" bind:checked={settings.reminderEmails} />
				</label>
			</div>
		</div>

		<div class="card rounded-box bg-base-200">
			<div class="card-body gap-4 p-5">
				<span class="text-lg font-semibold">App preferences</span>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div class="rounded-box bg-base-100 p-4">
						<span class="text-xs opacity-70">Theme</span>
						<div class="mt-1 font-medium">{settings.theme}</div>
					</div>
					<div class="rounded-box bg-base-100 p-4">
						<span class="text-xs opacity-70">Language</span>
						<div class="mt-1 font-medium">{settings.language}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="card rounded-box bg-base-200">
			<div class="card-body gap-4 p-5">
				<span class="text-lg font-semibold">Account Security</span>
				<div class="flex flex-col space-y-3">
					<a class="btn w-full btn-primary" href="/settings/mfa"
						>Manage Multi-Factor Authentication</a
					>
					<a class="btn w-full btn-error" href="/logout">Logout</a>
				</div>
			</div>
		</div>
	</div>
</div>
