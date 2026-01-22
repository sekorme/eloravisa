
export interface TranscriptEntry {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export enum SessionStatus {
    IDLE = 'IDLE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    ERROR = 'ERROR'
}
export enum MessageRole {
    USER = 'user',
    MODEL = 'model',
    SYSTEM = 'system'
}

export interface Message {
    id: string;
    role: MessageRole;
    text: string;
    timestamp: Date;
}

export enum ChatMode {
    TEXT = 'TEXT',
    VOICE = 'VOICE'
}

export interface LiveSessionConfig {
    voiceName?: string;
}

// Visualizer data type
export interface AudioVisualizerState {
    volume: number;
    isListening: boolean;
    isSpeaking: boolean;
}