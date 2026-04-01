<script lang="ts">
	import DailyJournal from '$components/app/home/journal/DailyJournal.svelte';
	import RecentJournalTable from '$components/app/journal/RecentJournalTable.svelte';

	let { data } = $props();
	let profile = $derived(data.profile!);
</script>

<svelte:head>
	<title>Journal</title>
</svelte:head>

<div class="flex flex-col space-y-4">
	<DailyJournal profile={data.profile!} />
	<RecentJournalTable {profile} recentsShort={data.recentJournals} />
</div>
