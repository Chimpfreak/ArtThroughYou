import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCloudflareImage } from '@/lib/cloudflare-ai';

const schema=z.object({prompt:z.string().min(10).max(4000)});
export async function POST(req:Request){
  try{
    const {prompt}=schema.parse(await req.json());
    const generated=await generateCloudflareImage(
      '@cf/black-forest-labs/flux-1-schnell',
      {prompt:`Create a museum-quality personal artwork based on this art direction: ${prompt}. Make the image visually coherent, richly detailed and appropriate to its historical art movement. No text, lettering, logos or watermark-like graphics.`,steps:4}
    );
    return NextResponse.json({dataUrl:`data:${generated.mimeType||'image/jpeg'};base64,${generated.image}`});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Image generation failed'},{status:502});}
}
