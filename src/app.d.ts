// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    // Common types
    type AvailabilityStatus = "available" | "unavailable" | "downloadable" | "downloading";
    
    type MonitorHandler = (monitor: { 
        addEventListener: (event: string, handler: (e: any) => void) => void 
    }) => void;

    // Summarizer types
    interface SummarizerOptions {
        type: "key-points" | "tldr" | "teaser" | "headline";
        format: "plain-text" | "markdown";
        length: "short" | "medium" | "long";
        monitor?: MonitorHandler;
    }

    interface SummarizeStreamingOptions {
        context?: string;
    }

    type SummarizerInstance = {
        ready?: Promise<void>;
        summarizeStreaming(text: string, options?: SummarizeStreamingOptions): AsyncIterable<string>;
    };

    // Language Detector types
    interface LanguageDetectorOptions {
        monitor?: MonitorHandler;
    }

    type LanguageDetectorInstance = {
        ready?: Promise<void>;
        detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
    };

    // Writer types
    interface WriterOptions {
        monitor?: MonitorHandler;
        tone?: "formal" | "neutral" | "casual";
        format?: "markdown" | "plain-text";
        length?: "short" | "medium" | "long";
        context?: string;
    }

    type WriterInstance = {
        ready?: Promise<void>;
        writeStreaming(prompt: string): AsyncIterable<string>;
    };

    // Rewriter types
    interface RewriterOptions {
        monitor?: MonitorHandler;
        tone?: "more-formal" | "as-is" | "more-casual";
        format?: "markdown" | "plain-text";
        length?: "shorter" | "as-is" | "longer";
        context?: string;
    }

    type RewriterInstance = {
        ready?: Promise<void>;
        rewriteStreaming(text: string, instructions: string): AsyncIterable<string>;
    };

    // Translator types
    interface TranslatorOptions {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: MonitorHandler;
    }

    type TranslatorInstance = {
        ready?: Promise<void>;
        translateStreaming(text: string): any;
    };

    // Window interface with all AI services
    interface Window {
        Summarizer: {
            availability(): Promise<AvailabilityStatus>;
            create(options: SummarizerOptions): Promise<SummarizerInstance>;
        };
        
        LanguageDetector: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: LanguageDetectorOptions): Promise<LanguageDetectorInstance>;
        };
        
        Writer: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: WriterOptions): Promise<WriterInstance>;
        };

        Rewriter: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: RewriterOptions): Promise<RewriterInstance>;
        };
        
        Translator: {
            availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<AvailabilityStatus>;
            create(options: TranslatorOptions): Promise<TranslatorInstance>;
        };

        LanguageModel: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: LanguageModelOptions): Promise<LanguageModelInstance>;
        };
    }
}

export {};
