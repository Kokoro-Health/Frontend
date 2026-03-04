<script>
	import { LinkedinIcon, TwitterIcon, YoutubeIcon } from '@lucide/svelte';
</script>

<footer class="footer-center footer footer-horizontal rounded bg-base-200 p-10 text-base-content">
	<nav class="grid grid-flow-col gap-4">
		<a class="link link-hover">About us</a>
		<a class="link link-hover">Contact</a>
		<a class="link link-hover">Jobs</a>
		<a class="link link-hover">Press kit</a>
	</nav>
	<nav>
		<div class="grid grid-flow-col gap-4">
			<a href="/">
				<TwitterIcon />
			</a>
			<a href="/">
				<YoutubeIcon />
			</a>
			<a href="/">
				<LinkedinIcon />
			</a>
		</div>
	</nav>
	<aside>
		<p>Copyright © {new Date().getFullYear()} - All right reserved by Kokoro</p>
	</aside>
</footer>
