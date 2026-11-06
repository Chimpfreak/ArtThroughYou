import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { z } from 'zod';

export const runtime = 'nodejs';
const schema = z.object({
  portrait: z.string().max(12_000_000).regex(/^data:image\/(png|jpeg|webp);base64,/),
  name: z.string().min(1).max(50),
  chapters: z.record(z.string(), z.object({ choiceTitle: z.string().max(120).optional(), story: z.string().max(1500).optional() })).optional(),
  memory: z.object({ theme: z.string().max(100).optional(), summary: z.string().max(1000).optional(), thread: z.array(z.string().max(300)).max(10).optional() }).optional()
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Four-timeline portraits need OPENAI_API_KEY configured in Vercel.' }, { status: 503 });
    const match = input.portrait.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if (!match) return NextResponse.json({ error: 'Unsupported portrait format.' }, { status: 400 });
    const mime = match[1];
    const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
    const image = await toFile(Buffer.from(match[2], 'base64'), `portrait.${ext}`, { type: mime });
    const choices = Object.values(input.chapters || {}).map(c => c.choiceTitle).filter(Boolean).join('; ');
    const context = [choices, input.memory?.theme, input.memory?.summary, ...(input.memory?.thread || [])].filter(Boolean).join('. ').slice(0, 3000);
    const prompt = `Use the uploaded photograph as the identity reference for the same adult person in every panel. Create ONE polished, high-resolution, landscape 2-by-2 contact sheet with four equal portrait scenes, no borders, captions, lettering, logos or watermarks. Preserve recognisable facial identity, facial proportions, skin tone and age consistently in all four panels. These are four parallel lives inspired by the person's choices: ${context || 'curiosity, connection, creativity and discovery'}. Panel 1 THE KEEPER: memory, roots and preserving what matters. Panel 2 THE EXPLORER: travel, discovery and brave new directions. Panel 3 THE CREATOR: making, invention and expressive work. Panel 4 THE CONNECTOR: community, collaboration and meaningful relationships. Give each scene distinct wardrobe, environment and lighting while keeping the person unmistakably the same. Sophisticated editorial portrait photography with subtle fine-art influence, natural anatomy and believable environments. Four timelines of one person, not four unrelated people.`;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.images.edit({ model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', image, prompt, size: '1536x1024' });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: 'The image service returned no image.' }, { status: 502 });
    return NextResponse.json({ dataUrl: `data:image/png;base64,${b64}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Timeline generation failed.' }, { status: 400 });
  }
}