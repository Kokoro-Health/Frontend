<script lang="ts">
	import { goto } from '$app/navigation';
	import { signIn, signUp, type SignInRequestDto } from '$lib/api';
	import { auth } from '$lib/store/auth.store';
	import { MailIcon, KeyRoundIcon, EyeOffIcon, EyeIcon, CircleXIcon } from '@lucide/svelte';

	const iconSize = 16;

	let signInData: SignInRequestDto = $state({
		email: '',
		password: '',
		rememberMe: false
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
		await signIn({
			body: signInData,
			credentials: 'include'
		})
			.then((res) => {
				if (res.error) {
					throw Error(res.error.message);
				}
				goto('/');
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
			signInData.password.length < 8 ||
			!signInData.email ||
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
		class="flex w-full max-w-xl flex-col space-y-5 rounded-box bg-base-200 p-8"
	>
		<div class="mb-3 flex flex-col space-y-3">
			<span class="text-2xl font-semibold">Welcome back!</span>
			<span>Are you new to Kokoro? <a class="link" href="/signup">Sign up here.</a></span>
		</div>
		<div class="flex flex-col space-y-3">
			<label class="input w-full">
				<span class="label"> <MailIcon size={iconSize} /> </span>
				<input
					type="email"
					bind:this={emailInput}
					bind:value={signInData.email}
					placeholder="someone@example.com"
				/>
			</label>
			<label class="input w-full">
				<span class="label"> <KeyRoundIcon size={iconSize} /> </span>
				<input
					type={showPassword ? 'text' : 'password'}
					bind:value={signInData.password}
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
				<input type="checkbox" bind:checked={signInData.rememberMe} class="checkbox" />
				Remember me
			</label>
			<span class="w-full text-end">
				<a class="link link-hover" href="/reset-password">Forgot password</a>
			</span>
		</div>
		<button disabled={!loginEnabled} type="submit" class="btn btn-primary">
			{#if loading}
				<div class="loading loading-sm"></div>
			{/if}
			<span>Login</span>
		</button>
	</form>
</div>
