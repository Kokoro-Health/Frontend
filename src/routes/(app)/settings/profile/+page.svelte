<script lang="ts">
	import { uploadProfilePicture } from '$api';
	import { invalidateAll } from '$app/navigation';
	import { UploadIcon } from '@lucide/svelte';

	let { data } = $props();

	let editGeneral = $state(false);
	let editVisual = $state(false);

	let fileInput: File | null = $state(null);
	let profilePictureUrl: string = $state('');

	$effect(() => {
		profilePictureUrl = getProfilePictureToDisplay();
	});

	$effect(() => {
		return () => {
			if (profilePictureUrl && profilePictureUrl.startsWith('blob:')) {
				URL.revokeObjectURL(profilePictureUrl);
			}
		};
	});

	function getProfilePictureToDisplay(): string {
		if (fileInput) {
			return URL.createObjectURL(fileInput);
		}
		return data.profile!.profilePictureUrl || '';
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			fileInput = input.files[0];
		}
	}

	async function changeProfilePicture() {
		if (!fileInput) return;

		try {
			await uploadProfilePicture({
				body: {
					file: fileInput
				}
			}).finally(() => {
				invalidateAll();
			});

			fileInput = null;
			editVisual = false;
		} catch (error) {
			console.error('Upload failed:', error);
		}
	}
</script>

<svelte:head>
	<title>Manage Profile</title>
</svelte:head>

<div class="flex flex-col space-y-4">
	<!-- General section remains the same -->
	<div class="card flex flex-col space-y-2 border border-base-200 p-4">
		<span class="text-lg font-semibold">General</span>
		<label class="input">
			<input disabled={!editGeneral} bind:value={data.profile!.firstName} />
			<span class="label">First Name</span>
		</label>
		{#if editGeneral || data.profile!.middleName !== ''}
			<label class="input">
				<input disabled={!editGeneral} bind:value={data.profile!.middleName} />
				<span class="label">Middle Name</span>
			</label>
		{/if}
		<label class="input">
			<input disabled={!editGeneral} bind:value={data.profile!.lastName} />
			<span class="label">Last Name</span>
		</label>
		<label class="input">
			<input disabled={!editGeneral} bind:value={data.profile!.email} />
			<span class="label">E-Mail</span>
		</label>

		<button
			class="btn w-full"
			onclick={() => {
				editGeneral = !editGeneral;
			}}>Edit</button
		>
	</div>

	<div class="card flex flex-col space-y-2 border border-base-200 p-4">
		<span class="text-lg font-semibold">Visual</span>
		<img class="h-16 w-16 rounded-full object-cover" src={profilePictureUrl} alt="Profile" />
		{#if editVisual}
			<input
				onchange={handleFileChange}
				disabled={!editVisual}
				type="file"
				accept="image/*"
				class="file-input w-full max-w-xs"
			/>
		{/if}
		{#if fileInput}
			<button class="btn w-full btn-primary" onclick={changeProfilePicture}>
				<UploadIcon size={18} /> Upload
			</button>
		{:else}
			<button
				class="btn w-full"
				onclick={() => {
					editVisual = !editVisual;
				}}>Edit</button
			>
		{/if}
	</div>
</div>
