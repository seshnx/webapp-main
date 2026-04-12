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

// Additional vendor types can be added here as needed
// declare module 'some-library' {
//   export function someFunction(...): ...;
// }
