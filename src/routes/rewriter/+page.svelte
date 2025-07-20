<script lang="ts">
    import Notify from "$lib/components/Notify.svelte";
    import Select from "$lib/components/Select.svelte";
    import { onMount, type Snippet  } from "svelte";

    type Props = {
        footer: Snippet;
    };

    let { footer }: Props = $props();

    let isBrowserSupported = $state(false);

    let prompt = $state("");
    let context = $state("");
    let result = $state("");
    let tone: "more-formal" | "as-is" | "more-casual" = $state("as-is");
    let format: "markdown" | "plain-text" = $state("markdown");
    let length: "shorter" | "as-is" | "longer" = $state("as-is");
    let isLoading = $state(false);

    let showNotification = $state(false);
    let notifyMessage = $state("");

    let toneOptions = [
        { value: "more-formal", label: "More Formal" },
        { value: "as-is", label: "As Is" },
        { value: "more-casual", label: "More Casual" },
    ];

    let formatOptions = [
        { value: "markdown", label: "Markdown" },
        { value: "plain-text", label: "Plain Text" },
    ];

    let lengthOptions = [
        { value: "shorter", label: "Shorter" },
        { value: "as-is", label: "As Is" },
        { value: "longer", label: "Longer" },
    ];

    async function generate() {
        const options = {
            tone,
            format,
            length,
        };

        const availability = await self.Rewriter.availability();
        let rewriter: any;
        result = "";

        function monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
                showNotification = true;
                notifyMessage = `Downloading Rewriter Model ${Math.round((e.loaded / e.total) * 100)}%`;
            });
        }

        if (availability === "unavailable") {
            console.error("Writer is not available");
            return;
        }

        if (availability === "available") {
            isLoading = true;
            rewriter = await self.Rewriter.create(options);
            const stream = rewriter.rewriteStreaming(prompt, { context });
            for await (const chunk of stream) {
                console.log({ chunk });
                result += chunk;
            }
            isLoading = false;
        } else {
            isLoading = true;
            rewriter = await self.Rewriter.create({
                ...options,
                monitor,
            });

            showNotification = false;

            const stream = rewriter.rewriteStreaming(prompt, { context });
            for await (const chunk of stream) {
                result += chunk;
            }
            isLoading = false;
        }
    }

    onMount(() => {
        isBrowserSupported = "Rewriter" in self;
    });
</script>

{#if !isBrowserSupported}
    <pre class="color-text-secondary text-align-center browser-not-supported">
        
        
✧✧✧✧✧
Your browser currently doesn’t support
the rewriter API. Try opening this page
in Chrome 138 or above.
✧✧✧✧✧
</pre>

    {@render footer()}
{:else}
    <div class="cnt">
        <div class="left-cnt">
            <div class="multiline-cnt">
                <textarea spellcheck="false" id="text" rows="16" bind:value={prompt} placeholder="Enter prompt"></textarea>
            </div>

            <div class="multiline-cnt">
                <label for="context" class="color-text-secondary">Context (optional)</label>
                <textarea spellcheck="false" id="text" rows="3" bind:value={context}></textarea>
            </div>

            <section class="config">
                <Select name="Tone" bind:value={tone} options={toneOptions} />
                <Select name="Format" bind:value={format} options={formatOptions} />
                <Select name="Length" bind:value={length} options={lengthOptions} />
            </section>

            <button id="generate" onclick={generate} class:isloading={isLoading}>Rewrite</button>

            <footer>
                {@render footer()}
            </footer>
        </div>

        {#if result}
            <div class="right-cnt">
                <section class="result">
                    <h2>✧✧✦ Revision ✦✧✧</h2>
                    <pre>{result}</pre>
                    <br /><br /><br /><br /><br /><br /><br />
                </section>
            </div>
        {/if}
    </div>
{/if}

<Notify message={notifyMessage} hide={!showNotification} />

<style>
    :root {
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
    }

    label {
        display: block;
        margin-bottom: 10px;
    }

    .config {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
        width: 100%;
    }

    .result {
        font-family: var(--font-mono);
        height: 100%;

        h2 {
            text-align: center;
        }

        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            width: 100%;
            line-height: 1.5;
        }
    }
</style>
