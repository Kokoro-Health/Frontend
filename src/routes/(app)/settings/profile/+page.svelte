<script lang="ts">
	let { data } = $props();

	let editGeneral = $state(false);
	let editVisual = $state(false);
</script>

<svelte:head>
	<title>Manage Profile</title>
</svelte:head>

<div class="flex flex-col space-y-4">
	<span class="w-full text-center text-base-content/50">IN DEVELOPMENT</span>
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
		<img
			class="h-16 w-16 rounded-full object-cover"
			src={data.profile!.profilePictureUrl}
			alt="Profile"
		/>
		<label class="input">
			<input disabled={!editVisual} bind:value={data.profile!.profilePictureUrl} />
			<span class="label">Profile Picture</span>
		</label>

		<button
			class="btn w-full"
			onclick={() => {
				editVisual = !editVisual;
			}}>Edit</button
		>
	</div>
</div>
