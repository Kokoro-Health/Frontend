<script lang="ts">
let { theme }: { theme: 'LIGHT' | 'DARK' | 'SYSTEM' } = $props();

$effect(() => {
  if (theme === 'SYSTEM') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', `kokoro-${theme.toLowerCase()}`);
  }
});
</script>