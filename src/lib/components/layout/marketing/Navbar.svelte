<script lang="ts">
	import type { ProfileResponseDto } from '$lib/api';
	import {
		Menu,
		X,
		Heart,
		ChevronDown,
		LayoutDashboard,
		MessageSquare,
		Settings,
		LogOut
	} from '@lucide/svelte';
	import { slide, fade } from 'svelte/transition';

	let { profile }: { profile: ProfileResponseDto | null } = $props();

	const SCROLL_THRESHOLD = 60;
	const TRANSITION_MS = 150;

	let scrolled = $state(false);
	let mobileOpen = $state(false);
	let platformOpen = $state(false);
	let accountOpen = $state(false);

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > SCROLL_THRESHOLD);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		const close = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('[data-platform-menu]')) platformOpen = false;
			if (!target.closest('[data-account-menu]')) accountOpen = false;
		};
		document.addEventListener('click', close);
		return () => document.removeEventListener('click', close);
	});

	const navLinks = [
		{ label: 'Features', href: '/features' },
		{ label: 'About', href: '/about' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Contact', href: '/contact' }
	];

	const platformLinks = [
		{
			label: 'App',
			href: '/app',
			icon: LayoutDashboard,
			description: 'Your personal Kokoro space'
		},
		{
			label: 'Forum',
			href: '/forum',
			icon: MessageSquare,
			description: 'Join the community'
		}
	];

	const accountLinks = [
		{ label: 'Settings', href: '/settings', icon: Settings },
		{ label: 'Log out', href: '/logout', icon: LogOut }
	];
</script>

<div class="h-16 w-full"></div>

<header
	class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
	class:bg-base-100={scrolled}
	class:shadow-md={scrolled}
	class:backdrop-blur-md={scrolled}
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
		<a href="/" class="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
			<Heart size={20} />
			Kokoro
		</a>

		<nav class="hidden md:block">
			<ul class="flex items-center gap-8">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="text-sm font-medium text-base-content/60 transition-colors duration-200 hover:text-base-content"
						>
							{link.label}
						</a>
					</li>
				{/each}

				<li class="relative" data-platform-menu>
					<button
						class="flex items-center gap-1 text-sm font-medium text-base-content/60 transition-colors duration-200 hover:text-base-content"
						onclick={() => (platformOpen = !platformOpen)}
					>
						Platform
						<ChevronDown
							size={14}
							class="transition-transform duration-200"
							style="transform: rotate({platformOpen ? 180 : 0}deg)"
						/>
					</button>

					{#if platformOpen}
						<div
							transition:fade={{ duration: TRANSITION_MS }}
							class="absolute top-10 left-1/2 w-64 -translate-x-1/2 rounded-2xl border border-base-200 bg-base-100 p-2 shadow-xl"
						>
							{#each platformLinks as item}
								<a
									href={item.href}
									class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-base-200"
									onclick={() => (platformOpen = false)}
								>
									<span class="mt-0.5 text-primary">
										<item.icon size={18} />
									</span>
									<div>
										<p class="text-sm font-semibold text-base-content">{item.label}</p>
										<p class="text-xs text-base-content/50">{item.description}</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				</li>
			</ul>
		</nav>

		<div class="hidden items-center gap-3 md:flex">
			{#if profile}
				<a href="/app" class="btn gap-2 rounded-full btn-sm btn-primary">
					<LayoutDashboard size={14} />
					Open App
				</a>

				<div class="relative" data-account-menu>
					<button
						onclick={() => (accountOpen = !accountOpen)}
						class="flex cursor-pointer items-center gap-2 rounded-full p-0.5 ring-2 ring-primary/30 transition-all hover:ring-primary/70"
					>
						<img
							src={profile.profilePictureUrl}
							alt="Avatar"
							class="h-8 w-8 rounded-full object-cover"
						/>
					</button>

					{#if accountOpen}
						<div
							transition:fade={{ duration: TRANSITION_MS }}
							class="absolute top-12 right-0 w-48 rounded-2xl border border-base-200 bg-base-100 p-2 shadow-xl"
						>
							{#each accountLinks as item}
								<a
									href={item.href}
									class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
									class:text-error={item.label === 'Log out'}
									class:hover:text-error={item.label === 'Log out'}
									onclick={() => (accountOpen = false)}
								>
									<item.icon size={15} />
									{item.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<a href="/login" class="btn btn-ghost btn-sm">Log in</a>
				<a href="/app" class="btn rounded-full btn-sm btn-primary">Get started</a>
			{/if}
		</div>

		<button
			class="btn btn-square btn-ghost btn-sm md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle navigation"
		>
			{#if mobileOpen}
				<X size={18} />
			{:else}
				<Menu size={18} />
			{/if}
		</button>
	</div>

	{#if mobileOpen}
		<div
			transition:slide={{ duration: TRANSITION_MS }}
			class="border-t border-base-200 bg-base-100 md:hidden"
		>
			<ul class="flex flex-col gap-1 px-6 py-4">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="block py-2 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
							onclick={() => (mobileOpen = false)}
						>
							{link.label}
						</a>
					</li>
				{/each}
				{#each platformLinks as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-2 py-2 text-sm font-medium text-base-content/70 transition-colors hover:text-base-content"
							onclick={() => (mobileOpen = false)}
						>
							<item.icon size={15} />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>

			<div class="flex flex-col gap-2 border-t border-base-200 px-6 pt-4 pb-6">
				{#if profile}
					<a
						href="/app"
						class="btn w-full gap-2 rounded-full btn-primary"
						onclick={() => (mobileOpen = false)}
					>
						<LayoutDashboard size={16} />
						Open App
					</a>
					{#each accountLinks as item}
						<a
							href={item.href}
							class="btn w-full justify-start gap-2 btn-ghost btn-sm"
							class:text-error={item.label === 'Log out'}
							onclick={() => (mobileOpen = false)}
						>
							<item.icon size={15} />
							{item.label}
						</a>
					{/each}
				{:else}
					<a href="/login" class="btn w-full btn-ghost">Log in</a>
					<a href="/app" class="btn w-full rounded-full btn-primary">Get started</a>
				{/if}
			</div>
		</div>
	{/if}
</header>
