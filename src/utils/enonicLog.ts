import {LOGGING} from '../common/env';

export const enonicDebug = (s?: string, ...params: any[]) => {
    enonicPrint('debug', s, ...params);
};

export const enonicLog = (s?: string, ...params: any[]) => {
    enonicPrint('log', s, ...params);
};

export const enonicInfo = (s?: string, ...params: any[]) => {
    enonicPrint('info', s, ...params);
};

export const enonicWarn = (s?: string, ...params: any[]) => {
    enonicPrint('warn', s, ...params);
};

export const enonicError = (s?: string, ...params: any[]) => {
    enonicPrint('error', s, ...params);
};

const enonicPrint = (type: 'log' | 'debug' | 'info' | 'warn' | 'error', s?: string, ...params: any[]) => {
    if (LOGGING) {
        const m = `\n[${new Date().toLocaleTimeString()}] ${s}:\n`;
        console[type](m, ...params, '\n');
    }
};
