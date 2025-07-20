<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import Notify from "$lib/components/Notify.svelte";

    type Props = {
        footer: Snippet;
    };

    let { footer }: Props = $props();

    type Prompt = {
        role: "system" | "user" | "assistant";
        content: string;
    };

    let isBrowserSupported = $state(false);

    let chatWindow: HTMLDivElement | null = $state(null);
    let chatInput: HTMLInputElement | null = $state(null);

    let systemPrompt = $state("");
    let prompts = $state<Prompt[]>([]);
    let session: any;
    let isSessionCreated = $state(false);
    let currentPrompt = $state("");
    let isLoading = $state(false);

    let showNotification = $state(false);
    let notifyMessage = $state("");

    async function createSession() {
        const availability = await self.LanguageModel.availability();

        if (availability === "unavailable") {
            console.error("LanguageModel is not available");
            return;
        }

        const initialPrompts = [
            {
                role: "system",
                content: systemPrompt,
            },
        ];

        function monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
                showNotification = true;
                notifyMessage = `Downloading Language Model ${Math.round((e.loaded / e.total) * 100)}%`;
            });
        }

        if (availability === "available") {
            session = await self.LanguageModel.create({ initialPrompts });
            isSessionCreated = true;
        } else {
            session = await self.LanguageModel.create({
                initialPrompts,
                monitor,
            });
            showNotification = false;
            isSessionCreated = true;
        }
    }

    function terminateSession() {
        session.terminate();
        isSessionCreated = false;
    }

    async function promptStreaming() {
        if (!currentPrompt) return;

        prompts = [
            ...prompts,
            {
                role: "user",
                content: currentPrompt,
            },
            {
                role: "assistant",
                content: "",
            },
        ];

        isLoading = true;

        const stream = session.promptStreaming(currentPrompt);
        currentPrompt = "";

        for await (const chunk of stream) {
            prompts[prompts.length - 1].content += chunk;

            chatWindow?.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: "smooth",
            });
        }

        isLoading = false;
    }

    onMount(() => {
        isBrowserSupported = "LanguageModel" in self;
    });

    $effect(() => {
        if (chatInput) {
            chatInput.focus();
            chatInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    promptStreaming();
                }
            });

            return () => {
                chatInput?.removeEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        promptStreaming();
                    }
                });
            };
        }
    });
</script>

{#if !isBrowserSupported}
    <pre class="color-text-secondary text-align-center browser-not-supported">
        
        
✧✧✧✧✧
Your browser currently doesn’t support
the language model API. Try opening this page
in Chrome 138 or above.
✧✧✧✧✧
</pre>

    {@render footer()}
{:else}
    <section>
        {#if !isSessionCreated}
            <div class="multiline-cnt">
                <label for="context" class="color-text-secondary">System Prompt (optional)</label>
                <textarea spellcheck="false" name="" id="" bind:value={systemPrompt} rows={4}></textarea>
            </div>

            <button onclick={createSession}>Create a Session</button>
        {/if}

        {#if isSessionCreated}
            <div bind:this={chatWindow} class="multiline-cnt chat-window">
                {#each prompts as prompt}
                    <label for="context" class="color-text-secondary">{prompt.role}</label>
                    <pre>{prompt.content}</pre>
                {/each}
            </div>

            <div class="multiline-cnt prompt-input">
                <input
                    spellcheck="false"
                    type="text"
                    bind:this={chatInput}
                    id="text"
                    bind:value={currentPrompt}
                    placeholder="Enter prompt"
                />
            </div>

            <div class="footer-cnt">
                <button onclick={promptStreaming} class:isloading={isLoading}>Send</button>
                <button class="secondary" onclick={terminateSession}>Create New Session</button>
            </div>
            <footer>
                {@render footer()}
            </footer>
        {/if}
    </section>
{/if}

<Notify message={notifyMessage} hide={!showNotification} />

<style>
    .multiline-cnt.prompt-input,
    .multiline-cnt.chat-window {
        max-width: 48rem;
    }

    .multiline-cnt {
        margin-bottom: 1.5rem;

        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            width: 100%;
            line-height: 1.5;
            padding-bottom: 1rem;
        }

        label {
            text-transform: capitalize;
        }

        input {
            width: 100%;
            border: none;
            outline: none;
            font-family: var(--font-mono);
            font-size: 0.875rem;
            background-color: transparent;
        }
    }

    .chat-window {
        max-height: 40rem;
        height: 32rem;
        overflow-y: auto;
    }

    .footer-cnt {
        display: flex;
        gap: 1rem;
        justify-content: flex-start;
    }
</style>
