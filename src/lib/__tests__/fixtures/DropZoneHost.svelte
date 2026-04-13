<script>
  import DropZone from '../../DropZone.svelte';

  export let onFiles;
  export let allowMultiple = true;
</script>

<DropZone {allowMultiple} on:files={(event) => onFiles?.(event.detail)} />
