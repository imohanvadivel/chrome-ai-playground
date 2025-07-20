<script lang="ts">
    import Summarizer from "./summarize/+page.svelte";
    import Translator from "./translate/+page.svelte";
    import Writer from "./writer/+page.svelte";
    import Rewriter from "./rewriter/+page.svelte";
    import Prompt from "./prompt/+page.svelte";

    const tabs = [
        { id: "summarization", label: "Summarization", component: Summarizer },
        { id: "translation", label: "Translation", component: Translator },
        { id: "writer", label: "Writer", component: Writer },
        { id: "rewriter", label: "Rewriter", component: Rewriter },
        { id: "prompt", label: "Prompt", component: Prompt },
    ];

    let activeTab = $state("summarization");

    function handleTabChange(tabId: string) {
        activeTab = tabId;
    }
</script>

<header>
    <h1>Chrome AI<br />Playground</h1>
    <div class="desc">
        <p class="color-text-secondary">
            This is a playground for testing and experimenting with the local Gemini Nano model bundled with the Chrome
            browser. While some APIs are live, while others are in origin trials, so support may vary by browser version.
        </p>

        <p class="color-text-secondary">
            Local models not only enhance privacy and security but also offer lower latency, offline access, reduced costs, and
            wider reach. Checkout <a href="https://developer.chrome.com/docs/ai/built-in" target="_blank">this page</a> to
            learn more.
        </p>
    </div>
</header>

{#snippet footer()}
    <p>
        Built with ♥ by <a href="https://x.com/imohanvadivel" target="_blank">Mohan Vadivel</a>, explore my
        <a href="https://mohanvadivel.com/projects" target="_blank">other projects</a>.<br />
        This project uses the <a href="https://departuremono.com/" target="_blank">Departure Mono</a> typeface, designed by
        <a href="https://www.helenazhang.com/" target="_blank">Helena Zhang</a>.
    </p>
{/snippet}

<article class="app-cnt">
    <nav>
        {#each tabs as tab}
            <label for={tab.id} class:active={activeTab === tab.id}>
                <input
                    type="radio"
                    name="tab"
                    value={tab.id}
                    checked={activeTab === tab.id}
                    id={tab.id}
                    onchange={() => handleTabChange(tab.id)}
                />
                <span class="arrow-active">► </span>{tab.label}
            </label>
        {/each}
    </nav>

    <main>
        {#each tabs as tab}
            {#if activeTab === tab.id}
                <tab.component {footer} />
            {/if}
        {/each}
    </main>
</article>

<style>
    header {
        display: flex;
        gap: 1rem;
        margin-top: 4.25rem;
        margin-bottom: 5rem;

        p {
            font-size: 0.875rem;
            max-width: 28rem;
            line-height: 1.4;
        }

        .desc {
            display: flex;
            flex-direction: row;
            gap: 1rem;
        }
    }

    @media (--medium-viewport) {
        header {
            flex-direction: column;
            gap: 2rem;
        }
    }

    @media (--small-viewport) {
        header {
            .desc {
                flex-direction: column;
            }
        }
    }

    h1 {
        font-size: 2rem;
        line-height: 1.1;
        margin-right: 2rem;
    }

    nav {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    main {
        height: 100%;
    }

    label {
        display: flex;
        align-items: center;
        position: relative;
        color: var(--color-text-secondary);
        cursor: pointer;

        input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
        }

        .arrow-active {
            opacity: 0;
        }
    }

    label.active {
        color: var(--color-text);

        .arrow-active {
            opacity: 1;
        }
    }

    label:not(.active) {
        .arrow-active {
            opacity: 0;
        }

        &:hover {
            .arrow-active {
                opacity: 1;
            }
        }
    }
</style>
