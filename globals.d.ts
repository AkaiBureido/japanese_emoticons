declare module "*.mdx";
declare module "*.md";
declare module "*.less";

declare var process : {
    env: {
        GA: string,
        DEBUG: boolean,
    },
}

declare var chrome: any;

interface Window {
    _meta: any,
    ga_debug: any,
}