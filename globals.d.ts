declare module "*.mdx";
declare module "*.md";

declare var process : {
    env: {
        GA: string
        DEBUG: boolean
    }
}