import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

const schema=z.object({
  era:z.object({name:z.string(),style:z.string(),fact:z.string(),choices:z.array(z.any())}),
  visitorName:z.string().max(40),
  choice:z.string(),
  memory:z.object({personality:z.string(),theme:z.string(),symbols:z.array(z.string()),thread:z.array(z.string()),summary:z.string()})
});

export async function POST(req:Request){
  try{
    const body=schema.parse(await req.json());
    const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
    const prompt=`You are the narrative writer for Art Through You, an interactive fictional journey through art history. Write a vivid second-person chapter (100-140 words) for ${body.visitorName}. Era: ${body.era.name}. Artistic conventions: ${body.era.style}. Historical grounding: ${body.era.fact}. Visitor choice: ${body.choice}. Journey memory: ${JSON.stringify(body.memory)}. Keep historical facts separate from fiction. Preserve the symbols and theme. Do not invent historical facts. Return only JSON with keys story (string), imagePrompt (string), memory (same memory shape). The imagePrompt should describe a museum-quality artwork depicting the visitor's story in the specified era's artistic language, with the persistent symbol transformed appropriately.`;
    const parts=await generateWithGemini(model,[{text:prompt}],{responseMimeType:'application/json',temperature:0.8});
    const raw=parts.find(p=>p.text)?.text;
    if(!raw)throw new Error('Gemini did not return the chapter JSON.');
    return NextResponse.json(JSON.parse(raw));
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid request'},{status:400});}
}