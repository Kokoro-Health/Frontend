<script lang="ts">
	import Footer from '$lib/components/layout/marketing/Footer.svelte';
	import Navbar from '$lib/components/layout/marketing/Navbar.svelte';

	let { children, data } = $props();
</script>

<Navbar profile={data.profile} />
{@render children()}
<Footer />
