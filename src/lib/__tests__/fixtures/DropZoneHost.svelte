<script>
  import DropZone from '../../DropZone.svelte';

  export let onFiles;
</script>

<DropZone on:files={(event) => onFiles?.(event.detail)} />
