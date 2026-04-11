<script lang="ts">
	import { updateProfile, uploadProfilePicture, type ProfileRequestDto } from '$api';
	import { invalidateAll } from '$app/navigation';
	import { Pencil, X, Check, User, Mail, Camera } from '@lucide/svelte';
	import { hapticImpact, hapticNotification } from '$util/haptics';
	import ManageDataSection from '$components/app/settings/profile/ManageDataSection.svelte';

	let { data } = $props();

	let editGeneral = $state(false);
	let isSavingGeneral = $state(false);
	let generalError = $state<string | null>(null);

	let editVisual = $state(false);
	let isUploading = $state(false);
	let uploadError = $state<string | null>(null);

	let fileInput = $state<File | null>(null);
	let blobUrl = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	let profileDraft = $state<ProfileRequestDto>({
		firstName: data.profile!.firstName,
		lastName: data.profile!.lastName,
		middleName: data.profile!.middleName,
		email: data.profile!.email
	});

	const profileChanged = $derived(
		profileDraft.firstName !== data.profile!.firstName ||
			profileDraft.middleName !== data.profile!.middleName ||
			profileDraft.lastName !== data.profile!.lastName ||
			profileDraft.email !== data.profile!.email
	);

	const avatarUrl = $derived(blobUrl ?? data.profile!.profilePictureUrl ?? '');

	const initials = $derived(
		`${data.profile!.firstName?.[0] ?? ''}${data.profile!.lastName?.[0] ?? ''}`.toUpperCase()
	);

	$effect(() => {
		const url = fileInput ? URL.createObjectURL(fileInput) : null;
		blobUrl = url;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});

	function startEditGeneral() {
		profileDraft = {
			firstName: data.profile!.firstName,
			lastName: data.profile!.lastName,
			middleName: data.profile!.middleName,
			email: data.profile!.email
		};
		generalError = null;
		editGeneral = true;
		hapticImpact('light');
	}

	function cancelEditGeneral() {
		editGeneral = false;
		generalError = null;
	}

	async function saveGeneral() {
		if (!profileChanged) return;
		isSavingGeneral = true;
		generalError = null;
		try {
			await updateProfile({ body: profileDraft });
			await invalidateAll();
			editGeneral = false;
			await hapticNotification('success');
			hapticImpact('medium');
		} catch {
			generalError = 'Failed to save changes.';
			await hapticNotification('error');
		} finally {
			isSavingGeneral = false;
		}
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		fileInput = input.files?.[0] ?? null;
		uploadError = null;
	}

	function cancelEditVisual() {
		editVisual = false;
		fileInput = null;
		uploadError = null;
	}

	async function uploadAvatar() {
		if (!fileInput) return;
		isUploading = true;
		uploadError = null;
		try {
			await uploadProfilePicture({ body: { file: fileInput } });
			await invalidateAll();
			fileInput = null;
			editVisual = false;
			await hapticNotification('success');
		} catch {
			uploadError = 'Failed to upload picture.';
			await hapticNotification('error');
		} finally {
			isUploading = false;
		}
	}
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="flex w-full flex-col gap-6">
	<div class="mb-2">
		<p class="text-sm font-medium text-base-content/60">Manage your personal info</p>
	</div>

	<div class="flex items-center gap-4 rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
		<div class="relative">
			{#if avatarUrl}
				<img
					class="h-20 w-20 rounded-full object-cover ring-2 ring-base-200"
					src={avatarUrl}
					alt="Profile"
				/>
			{:else}
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full bg-base-200 text-xl font-semibold"
				>
					{initials}
				</div>
			{/if}
			<button
				onclick={() => {
					editVisual = !editVisual;
					hapticImpact('light');
				}}
				class="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content shadow-lg transition-transform active:scale-95"
			>
				<Camera size={16} />
			</button>
		</div>
		<div class="flex flex-col gap-0.5">
			<span class="text-lg font-semibold">{data.profile?.firstName} {data.profile?.lastName}</span>
			<span class="text-sm text-base-content/50">{data.profile?.email}</span>
		</div>
	</div>

	{#if editVisual}
		<div class="rounded-xl border border-base-200/60 bg-base-100/40 p-4">
			<p class="mb-3 text-sm font-medium text-base-content/60">Change photo</p>
			<input type="file" accept="image/*" class="file-input w-full" onchange={handleFileChange} />
			{#if uploadError}
				<p class="mt-2 text-sm text-error">{uploadError}</p>
			{/if}
			<div class="mt-3 flex gap-2">
				<button class="btn flex-1 btn-ghost btn-sm" onclick={cancelEditVisual}>Cancel</button>
				{#if fileInput}
					<button
						class="btn flex-1 btn-sm btn-primary"
						onclick={uploadAvatar}
						disabled={isUploading}
					>
						{#if isUploading}
							<span class="loading loading-xs loading-spinner"></span>
						{:else}
							Upload
						{/if}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<div class="rounded-2xl border border-base-200/60 bg-base-100/60 p-4">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<User class="h-4 w-4 text-base-content/50" />
				<span class="text-sm font-semibold text-base-content/70">Personal Info</span>
			</div>
			{#if editGeneral}
				<button class="btn btn-ghost btn-xs" onclick={cancelEditGeneral}>
					<X size={14} /> Cancel
				</button>
			{:else}
				<button class="btn btn-ghost btn-xs" onclick={startEditGeneral}>
					<Pencil size={14} /> Edit
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<label for="firstName" class="text-xs font-medium text-base-content/50">First name</label>
					<input
						id="firstName"
						class="input-bordered input input-sm w-full bg-base-100/50"
						disabled={!editGeneral}
						bind:value={profileDraft.firstName}
					/>
				</div>
				<div class="flex flex-col gap-1">
					<label for="lastName" class="text-xs font-medium text-base-content/50">Last name</label>
					<input
						id="lastName"
						class="input-bordered input input-sm w-full bg-base-100/50"
						disabled={!editGeneral}
						bind:value={profileDraft.lastName}
					/>
				</div>
			</div>

			{#if editGeneral || profileDraft.middleName}
				<div class="flex flex-col gap-1">
					<label for="middleName" class="text-xs font-medium text-base-content/50"
						>Middle name</label
					>
					<input
						id="middleName"
						class="input-bordered input input-sm w-full bg-base-100/50"
						disabled={!editGeneral}
						bind:value={profileDraft.middleName}
					/>
				</div>
			{/if}

			<div class="flex flex-col gap-1">
				<label for="email" class="text-xs font-medium text-base-content/50">
					<Mail class="mr-1 inline h-3 w-3" /> Email
				</label>
				<input
					id="email"
					type="email"
					class="input-bordered input input-sm w-full bg-base-100/50"
					disabled={!editGeneral}
					bind:value={profileDraft.email}
				/>
			</div>

			{#if generalError}
				<p class="text-sm text-error">{generalError}</p>
			{/if}

			{#if editGeneral}
				<button
					class="btn mt-2 btn-sm btn-primary"
					onclick={saveGeneral}
					disabled={!profileChanged || isSavingGeneral}
				>
					{#if isSavingGeneral}
						<span class="loading loading-xs loading-spinner"></span>
					{:else}
						<Check size={14} />
					{/if}
					Save Changes
				</button>
			{/if}
		</div>
	</div>
	<ManageDataSection />
</div>
