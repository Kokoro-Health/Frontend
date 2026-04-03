<script lang="ts">
	import { updateProfile, uploadProfilePicture, type ProfileRequestDto } from '$api';
	import { invalidateAll } from '$app/navigation';
	import { UploadIcon, PencilIcon, XIcon, CheckIcon } from '@lucide/svelte';

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
		} catch {
			generalError = 'Failed to save changes. Please try again.';
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
		} catch {
			uploadError = 'Failed to upload picture. Please try again.';
		} finally {
			isUploading = false;
		}
	}
</script>

<svelte:head>
	<title>Manage Profile</title>
</svelte:head>

<div class="mx-auto flex max-w-lg flex-col gap-4">
	<div class="card border border-base-200 p-4">
		<div class="mb-4 flex items-center justify-between">
			<span class="text-lg font-semibold">General</span>
			{#if editGeneral}
				<button class="btn btn-ghost btn-sm" onclick={cancelEditGeneral}>
					<XIcon size={15} /> Cancel
				</button>
			{:else}
				<button class="btn btn-ghost btn-sm" onclick={startEditGeneral}>
					<PencilIcon size={15} /> Edit
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			<label class="input w-full">
				<span class="label">First Name</span>
				<input
					class="w-full"
					disabled={!editGeneral}
					bind:value={profileDraft.firstName}
					placeholder="First name"
				/>
			</label>

			{#if editGeneral || profileDraft.middleName}
				<label class="input w-full">
					<span class="label">Middle Name</span>
					<input
						class="w-full"
						disabled={!editGeneral}
						bind:value={profileDraft.middleName}
						placeholder="Middle name"
					/>
				</label>
			{/if}

			<label class="input w-full">
				<span class="label">Last Name</span>
				<input
					class="w-full"
					disabled={!editGeneral}
					bind:value={profileDraft.lastName}
					placeholder="Last name"
				/>
			</label>

			<label class="input w-full">
				<span class="label">Email</span>
				<input
					class="w-full"
					type="email"
					disabled={!editGeneral}
					bind:value={profileDraft.email}
					placeholder="Email address"
				/>
			</label>

			{#if generalError}
				<p class="text-sm text-error">{generalError}</p>
			{/if}

			{#if editGeneral}
				<button
					class="btn w-full btn-primary"
					onclick={saveGeneral}
					disabled={!profileChanged || isSavingGeneral}
				>
					<CheckIcon size={15} />
					{isSavingGeneral ? 'Saving…' : 'Save Changes'}
				</button>
			{/if}
		</div>
	</div>

	<div class="card border border-base-200 p-4">
		<div class="mb-4 flex items-center justify-between">
			<span class="text-lg font-semibold">Profile Picture</span>
			{#if editVisual}
				<button class="btn btn-ghost btn-sm" onclick={cancelEditVisual}>
					<XIcon size={15} /> Cancel
				</button>
			{:else}
				<button class="btn btn-ghost btn-sm" onclick={() => (editVisual = true)}>
					<PencilIcon size={15} /> Edit
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-4">
				{#if avatarUrl}
					<img
						class="h-20 w-20 rounded-full object-cover ring-2 ring-base-300"
						src={avatarUrl}
						alt="Profile"
					/>
				{:else}
					<div
						class="flex h-20 w-20 items-center justify-center rounded-full bg-base-300 text-xl font-semibold"
					>
						{initials}
					</div>
				{/if}
			</div>

			{#if editVisual}
				<input type="file" accept="image/*" class="file-input w-full" onchange={handleFileChange} />
			{/if}

			{#if uploadError}
				<p class="text-sm text-error">{uploadError}</p>
			{/if}

			{#if fileInput}
				<button class="btn w-full btn-primary" onclick={uploadAvatar} disabled={isUploading}>
					<UploadIcon size={15} />
					{isUploading ? 'Uploading…' : 'Upload Picture'}
				</button>
			{/if}
		</div>
	</div>
</div>
