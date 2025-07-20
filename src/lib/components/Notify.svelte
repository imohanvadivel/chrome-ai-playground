<script lang="ts">
    let { message, hide = false } = $props();
</script>

<div class="notify" class:hide>
    {message}
</div>

<style>
    .notify {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: fit-content;
        max-width: 80vw;
        background-color: #000;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-family: var(--font-mono);
        z-index: 10;
        transition: bottom 0.3s ease-in-out;
    }

    .hide {
        bottom: -3rem;
    }
</style>
