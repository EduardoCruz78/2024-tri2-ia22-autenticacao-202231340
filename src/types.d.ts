// src/types.d.ts
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
        userName?: string;
    }
}