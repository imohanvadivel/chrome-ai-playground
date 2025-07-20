<script lang="ts">
    import Notify from "$lib/components/Notify.svelte";
    import Select from "$lib/components/Select.svelte";
    import { onMount, type Snippet } from "svelte";

    type Props = {
        footer: Snippet;
    };

    let { footer }: Props = $props();

    let isBrowserSupported = $state(false);

    let text = $state("");
    let sourceLanguage = $state("auto");
    let targetLanguage = $state("ta");
    let translatedText = $state("");
    let isLoading = $state(false);

    let showNotification = $state(false);
    let notifyMessage = $state("");

    async function detectLanguage() {
        if ("LanguageDetector" in self) {
            console.log("Language detector supported");
        } else {
            console.log("Language detector not supported");
            return;
        }

        const availability = await self.LanguageDetector.availability();
        let detector;

        function monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
                showNotification = true;
                notifyMessage = `Downloading Language Detector Model ${Math.round((e.loaded / e.total) * 100)}%`;
            });
        }

        if (availability === "unavailable") {
            // Model is not available
            notifyMessage = "Language detector is not available in your browser";
            showNotification = true;
            return;
        }

        if (availability === "available") {
            // Model is available for use
            isLoading = true;
            detector = await self.LanguageDetector.create();
            const result = await detector.detect(text);

            if (result.length === 0) {
                console.error(`language can't be detected`);
                return;
            }

            return result[0];
        } else {
            // Model is available for download
            isLoading = true;
            detector = await self.LanguageDetector.create({
                monitor,
            });

            showNotification = false;

            await detector.ready;

            const result = await detector.detect(text);

            if (result.length === 0) {
                console.error(`language can't be detected`);
                return;
            }

            return result[0];
        }
    }

    async function translate(sourceLanguage: string, targetLanguage: string, textToTranslate: string) {
        if (!("Translator" in self)) {
            console.log({ sourceLanguage, targetLanguage });
            console.error("Translator not supported!!!");
            return;
        }

        const translatorCapabilities = await self.Translator.availability({
            sourceLanguage,
            targetLanguage,
        });

        function monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
                showNotification = true;
                notifyMessage = `Downloading Translator Model for ${sourceLanguage} to ${targetLanguage} pair ${Math.round((e.loaded / e.total) * 100)}%`;
            });
        }

        if (translatorCapabilities === "unavailable") {
            notifyMessage = "Translator is not available in your browser";
            showNotification = true;
            return;
        }

        if (translatorCapabilities === "available") {
            isLoading = true;
            const translator = await self.Translator.create({
                sourceLanguage,
                targetLanguage,
            });

            try {
                const stream = await translator.translateStreaming(textToTranslate);
                for await (const chunk of stream) {
                    translatedText += chunk;
                }
            } catch (error) {
                console.log(error);
                notifyMessage = error as string;
                showNotification = true;
                setTimeout(() => {
                    isLoading = false;
                }, 2000);
            }
            isLoading = false;
            return translatedText;
        } else {
            isLoading = true;
            const translator = await self.Translator.create({
                sourceLanguage,
                targetLanguage,
                monitor,
            });

            showNotification = false;

            await translator.ready;
            try {
                const stream = await translator.translateStreaming(textToTranslate);
                for await (const chunk of stream) {
                    translatedText += chunk;
                }
            } catch (error) {
                console.log(error);
                notifyMessage = error as string;
                showNotification = true;
                setTimeout(() => {
                    isLoading = false;
                }, 2000);
            }
            isLoading = false;
            return translatedText;
        }
    }

    async function translateContent() {
        const { confidence, detectedLanguage } = (await detectLanguage()) as {
            confidence: number;
            detectedLanguage: string;
        };

        if (confidence < 0.5) {
            throw new Error("unable to detect language");
        }

        sourceLanguage = detectedLanguage;
        await translate(sourceLanguage, targetLanguage, text);
    }

    let languageCodes = [
        { label: "English", value: "en" },
        { label: "Kannada", value: "kn" },
        { label: "Tamil", value: "ta" },
        { label: "Telugu", value: "te" },
        { label: "Marathi", value: "mr" },
        { label: "Arabic", value: "ar" },
        { label: "Bengali", value: "bn" },
        { label: "German", value: "de" },
        { label: "French", value: "fr" },
        { label: "Hindi", value: "hi" },
        { label: "Italian", value: "it" },
        { label: "Korean", value: "ko" },
        { label: "Dutch", value: "nl" },
        { label: "Polish", value: "pl" },
        { label: "Portuguese", value: "pt" },
        { label: "Russian", value: "ru" },
        { label: "Thai", value: "th" },
        { label: "Turkish", value: "tr" },
        { label: "Vietnamese", value: "vi" },
        { label: "Chinese (Simplified)", value: "zh" },
        { label: "Chinese (Traditional)", value: "zh-Hant" },
        { label: "Bulgarian", value: "bg" },
        { label: "Czech", value: "cs" },
        { label: "Danish", value: "da" },
        { label: "Greek", value: "el" },
        { label: "Finnish", value: "fi" },
        { label: "Croatian", value: "hr" },
        { label: "Hungarian", value: "hu" },
        { label: "Indonesian", value: "id" },
        { label: "Hebrew", value: "iw" },
        { label: "Norwegian", value: "no" },
        { label: "Romanian", value: "ro" },
        { label: "Slovak", value: "sk" },
        { label: "Slovenian", value: "sl" },
        { label: "Swedish", value: "sv" },
        { label: "Ukrainian", value: "uk" },
    ];

    onMount(() => {
        isBrowserSupported = "LanguageDetector" in self && "Translator" in self;
    });
</script>

{#if !isBrowserSupported}
    <pre class="color-text-secondary text-align-center browser-not-supported">
        
        
✧✧✧✧✧
Your browser currently doesn’t support
the translation API. Try opening
this page in Chrome 138 or above.
✧✧✧✧✧
</pre>

    <footer>
        {@render footer()}
    </footer>
{:else}
    <div class="cnt">
        <div class="left-cnt">
            <div class="multiline-cnt">
                <textarea spellcheck="false" name="" id="" bind:value={text} rows={20} placeholder="Enter text to translate"
                ></textarea>
            </div>
            <section class="config">
                <Select name="Target Language" bind:value={targetLanguage} options={languageCodes} />
            </section>

            <button onclick={translateContent} class:isloading={isLoading}>Translate</button>

            <footer>
                {@render footer()}
            </footer>
        </div>

        {#if translatedText}
            <div class="right-cnt">
                <section class="result">
                    <h2>✧✧✦ Translation ✦✧✧</h2>
                    <pre>{translatedText}</pre>
                    <br /><br /><br /><br /><br /><br /><br />
                </section>
            </div>
        {/if}
    </div>
{/if}

<Notify message={notifyMessage} hide={!showNotification} />

<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 420px;
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
