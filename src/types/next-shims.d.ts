declare module 'next' {
  export type Metadata = any;
  export type Viewport = any;
  const next: any;
  export default next;
}

declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
  export type Metadata = any;
  export type Viewport = any;
}

declare module 'next/server' {
  export class NextResponse {
    static json(body: any, init?: { status?: number; headers?: any }): any;
  }
  export type NextRequest = any;
}

declare module 'next/server.js' {
  export class NextResponse {
    static json(body: any, init?: { status?: number; headers?: any }): any;
  }
  export type NextRequest = any;
}

