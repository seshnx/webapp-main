// =====================================================
// VENDOR TYPE DECLARATIONS
// For third-party libraries without official TypeScript types
// =====================================================

declare module 'pannellum' {
  export default class Viewer {
    constructor(element: HTMLElement | string, config: any);
    onDestroy(): void;
  }
}

declare module '@vercel/blob' {
  export function put(
    key: string,
    body: Blob | Buffer | ReadableStream | File,
    options?: {
      access?: 'public';
      token?: string;
      addRandomSuffix?: boolean;
    }
  ): Promise<{ url: string }>;

  export function del(url: string[]): Promise<void>;
}

// Additional vendor types can be added here as needed
// declare module 'some-library' {
//   export function someFunction(...): ...;
// }
