// // Declare Summarizer and ai as globals, to avoid the TS compiler complaining about unknown
// // objects in the global scope.
// declare global {
//     interface Window {
//         Summarizer: any;
//         ai: any;
//     }
// }

type AvailabilityStatus = "no" | "readily" | "after-download";

type LangDetectorCapabilities = {
  available: AvailabilityStatus;
  capabilities: AvailabilityStatus;
  languageAvailable: (languageCode: string) => AvailabilityStatus;
}

type LangDetectorOptions = {
  monitor?: (monitor: EventTarget) => void;
}

type LangDetectorInstance = {
  ready: Promise<void>;
  detect: (text: string) => Promise<Array<{
    detectedLanguage: string;
    confidence: number;
  }>>;
}

type LangDetector = {
  capabilities: () => Promise<LangDetectorCapabilities>;
  create: (options?: LangDetectorOptions) => Promise<LangDetectorInstance>;
}

type SummarizerOptions = {
  sharedContext?: string;
  type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  monitor?: (monitor: EventTarget) => void;
}

type Summarizer = {
  capabilities: () => Promise<{ available: AvailabilityStatus }>;
  create: (options?: SummarizerOptions) => Promise<SummarizerInstance>;
}

type SummarizerInstance = {
  ready: Promise<void>;
  addEventListener: (event: string, callback: (e: { loaded: number; total: number }) => void) => void;
  summarize: (text: string, options?: { context?: string }) => Promise<string>;
  summarizeStreaming: (text: string, options?: { context?: string }) => ReadableStream<string>;
}

type TranslatorCapabilities = {
  languagePairAvailable: (sourceLanguage: string, targetLanguage: string) => AvailabilityStatus;
}

type TranslatorOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: EventTarget) => void;
}

type TranslatorInstance = {
  ready: Promise<void>;
  translate: (text: string) => Promise<string>;
}

type Translator = {
  capabilities: () => Promise<TranslatorCapabilities>;
  create: (options: TranslatorOptions) => Promise<TranslatorInstance>;
}

type WebAI = {
  languageDetector?: LangDetector;
  translator?: Translator;
  summarizer?: Summarizer;
};

type SelfWithAI = typeof self & {
  ai?: WebAI;
};
