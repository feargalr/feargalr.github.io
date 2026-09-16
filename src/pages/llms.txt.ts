import { llmsSummary } from '../lib/llms';
export const GET = () => new Response(llmsSummary(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
