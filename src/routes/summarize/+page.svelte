<script lang="ts">
    import Notify from "$lib/components/Notify.svelte";
    import Select from "$lib/components/Select.svelte";
    import { onMount, type Snippet } from "svelte";

    type Props = {
        footer: Snippet;
    };

    let { footer }: Props = $props();

    let isBrowserSupported = $state(false);

    let summaryType: "key-points" | "tldr" | "teaser" | "headline" = $state("key-points");
    let summaryFormat: "plain-text" | "markdown" = $state("plain-text");
    let summaryLength: "short" | "medium" | "long" = $state("short");
    let context = $state("");
    let text = $state("");
    let result = $state(``);
    let isLoading = $state(false);

    let showNotification = $state(false);
    let notifyMessage = $state("");

    let summaryTypeOptions = [
        { value: "key-points", label: "Key Points" },
        { value: "tldr", label: "TLDR" },
        { value: "teaser", label: "Teaser" },
        { value: "headline", label: "Headline" },
    ];

    let summaryFormatOptions = [
        { value: "plain-text", label: "Plain Text" },
        { value: "markdown", label: "Markdown" },
    ];

    let summaryLengthOptions = [
        { value: "short", label: "Short" },
        { value: "medium", label: "Medium" },
        { value: "long", label: "Long" },
    ];

    async function summarize() {
        const options = {
            type: summaryType,
            format: summaryFormat,
            length: summaryLength,
        };

        const availability = await self.Summarizer.availability();
        let summarizer;
        result = "";

        function monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
                showNotification = true;
                notifyMessage = `Downloading Summarizer Model ${Math.round((e.loaded / e.total) * 100)}%`;
            });
        }

        if (availability === "unavailable") {
            console.error("Summarizer is not available");
            notifyMessage = "Summarizer is not available in your browser";
            showNotification = true;
            return;
        }
        try {
            if (availability === "available") {
                // Model is available for use
                console.log("Summarizer is available");

                isLoading = true;

                summarizer = await self.Summarizer.create(options);
                const stream = summarizer.summarizeStreaming(text, { context });

                for await (const chunk of stream) {
                    result += chunk;
                }

                isLoading = false;
            } else {
                // Model is available for download
                console.log("Summarizer is available for download");

                isLoading = true;

                summarizer = await self.Summarizer.create({
                    ...options,
                    monitor,
                });

                showNotification = false;

                const stream = summarizer.summarizeStreaming(text, { context });

                for await (const chunk of stream) {
                    result += chunk;
                }

                isLoading = false;
            }
        } catch (error) {
            notifyMessage = error as string;
            showNotification = true;
            isLoading = false;
            setTimeout(() => {
                showNotification = false;
            }, 2000);
        }
    }

    onMount(async () => {
        isBrowserSupported = "Summarizer" in self;
    });
</script>

{#if !isBrowserSupported}
    <pre class="color-text-secondary text-align-center browser-not-supported">
        
        
✧✧✧✧✧
Your browser currently doesn’t support
the summarization API. Try opening
this page in Chrome 138 or above
✧✧✧✧✧
</pre>
    <footer>
        {@render footer()}
    </footer>
{:else}
    <div class="cnt">
        <div class="left-cnt">
            <div class="multiline-cnt">
                <textarea spellcheck="false" bind:value={text} rows={16} placeholder="Enter text to summarize"></textarea>
            </div>
            <div class="multiline-cnt">
                <label for="context" class="color-text-secondary">Context (optional)</label>
                <textarea spellcheck="false" bind:value={context} rows={3}></textarea>
            </div>

            <section class="config">
                <Select name="Type" bind:value={summaryType} options={summaryTypeOptions} />
                <Select name="Format" bind:value={summaryFormat} options={summaryFormatOptions} />
                <Select name="Length" bind:value={summaryLength} options={summaryLengthOptions} />
            </section>

            <button onclick={summarize} class:isloading={isLoading}>Summarize</button>

            <footer>
                {@render footer()}
            </footer>
        </div>

        {#if result}
            <div class="right-cnt">
                <section class="result">
                    <h2>✧✧✦ Summary ✦✧✧</h2>
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

    .config {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
        width: 100%;
        margin-top: 0.5rem;
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
