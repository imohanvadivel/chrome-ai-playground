<script lang="ts">
    import "$lib/styles/global.css";
</script>

<svelte:head>
    <title>AI Playground</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<div class="layout-cnt">
    <slot />
</div>

<style>
    .layout-cnt {
        padding: 0 3rem;

        @media (--medium-viewport) {
            padding: 0 2rem;
        }

        @media (--small-viewport) {
            padding: 0 1rem;
        }
    }
</style>
