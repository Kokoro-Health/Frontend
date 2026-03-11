<script lang="ts">
	import { signUp, type SignUpRequestDto } from '$lib/api';
	import { MailIcon, KeyRoundIcon, EyeOffIcon, EyeIcon, CircleXIcon } from '@lucide/svelte';

	const iconSize = 16;

	let signUpData: SignUpRequestDto = $state({
		email: '',
		password: '',
		firstName: '',
		middleName: '',
		lastName: '',
		tosAccepted: false
	});
	let showPassword = $state(false);
	let error: string | null = $state(null);
	let loading = $state(false);
	let loginEnabled = $derived(inputsValid());
	let emailInput: HTMLInputElement | null = $state(null);

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = null;
		await signUp({
			body: signUpData,
			credentials: 'include'
		})
			.then((res) => {
				if (res.error) {
					throw Error(res.error.message);
				}
				location.reload();
			})
			.catch((e: Error) => {
				error = e.message;
			})
			.finally(() => {
				loading = false;
			});
	}

	function inputsValid(): boolean {
		if (
			signUpData.password.length < 8 ||
			!signUpData.email ||
			!emailInput ||
			!emailInput.validity.valid
		)
			return false;
		return true;
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center">
	<form
		onsubmit={(e) => submitForm(e)}
		class="card flex w-full max-w-xl flex-col space-y-5 rounded-box bg-base-200 p-8"
	>
		<div class="mb-3 flex flex-col space-y-3">
			<span class="text-2xl font-semibold">Welcome to Kokoro!</span>
			<span>Already have an account? <a class="link" href="/login">Login here.</a></span>
		</div>
		<div class="flex flex-col space-y-3">
			<div class="flex flex-row space-x-2">
				<label class="input w-full">
					<input type="text" bind:value={signUpData.firstName} placeholder="First name" />
				</label>
				<label class="input w-full">
					<input type="text" bind:value={signUpData.middleName} placeholder="Middle name" />
				</label>
				<label class="input w-full">
					<input type="text" bind:value={signUpData.lastName} placeholder="Last name" />
				</label>
			</div>
			<label class="input w-full">
				<span class="label"> <MailIcon size={iconSize} /> </span>
				<input
					type="email"
					bind:this={emailInput}
					bind:value={signUpData.email}
					placeholder="someone@example.com"
				/>
			</label>
			<label class="input w-full">
				<span class="label"> <KeyRoundIcon size={iconSize} /> </span>
				<input
					type={showPassword ? 'text' : 'password'}
					bind:value={signUpData.password}
					placeholder="Password"
				/>
				<span class="label">
					<button
						type="button"
						class="hover:cursor-pointer"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeIcon size={iconSize} />
						{:else}
							<EyeOffIcon size={iconSize} />
						{/if}
					</button>
				</span>
			</label>
		</div>
		{#if error}
			<div class="card flex flex-row items-center justify-start space-x-3 bg-error p-4">
				<span class="min-w-6"><CircleXIcon /></span>
				<span>{error}</span>
			</div>
		{/if}
		<div class="flex justify-between">
			<label class="label w-full">
				<input type="checkbox" bind:checked={signUpData.tosAccepted} class="checkbox" />
				<span
					>I accept the <a href="#" class="link link-hover" target="_blank">Terms of Service</a
					>.</span
				>
			</label>
		</div>
		<button disabled={!loginEnabled} type="submit" class="btn btn-primary">
			{#if loading}
				<div class="loading loading-sm"></div>
			{/if}
			<span>Sign Up</span>
		</button>
	</form>
</div>
