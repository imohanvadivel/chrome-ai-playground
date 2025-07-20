<script lang="ts">
    let { name, options, value = $bindable() } = $props();
    let id = crypto.randomUUID();

    let selectedLabel = $derived(options.find((option: any) => option.value === value)?.label);
</script>

<label for={id}>
    <span class="label">{name}:</span>
    <span class="select-value">
        {selectedLabel} <span class="arrow">▼</span>
        <select {name} {id} bind:value>
            {#each options as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    </span>
</label>

<style>
    label {
        font-size: 0.875rem;
        font-family: var(--font-mono);
    }

    .select-value {
        position: relative;
    }

    .label {
        color: var(--color-text-secondary);
    }

    .arrow {
        font-size: 0.5rem;
    }

    select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
</style>
