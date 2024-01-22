import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

export interface Context {
    headers?: ReadonlyHeaders | Headers
    locale?: string
    contentPath: string | string[]
}