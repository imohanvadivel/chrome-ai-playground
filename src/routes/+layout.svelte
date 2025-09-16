<script lang="ts">
    import "$lib/styles/global.css";
</script>

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
