import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

export const maxDuration = 20;
const schema=z.object({
  era:z.object({name:z.string(),style:z.string(),fact:z.string(),choices:z.array(z.any())}),
  visitorName:z.string().max(40),
  choice:z.string(),
  memory:z.object({personality:z.string(),theme:z.string(),symbols:z.array(z.string()),thread:z.array(z.string()),summary:z.string()})
});

export async function POST(req:Request){
  try{
    const body=schema.parse(await req.json());
    const model=process.env.GEMINI_MODEL||'gemini-3.1-flash-lite';
    const memoryContext=[
      body.memory.theme,
      body.memory.symbols.slice(0,2).join(', '),
      body.memory.thread.slice(-2).join('; '),
      body.memory.summary
    ].filter(Boolean).join(' | ').slice(0,700);
    const prompt=`Write a vivid second-person art-history story for ${body.visitorName}. Era: ${body.era.name}. Style: ${body.era.style}. Historical anchor: ${body.era.fact}. Choice: ${body.choice}. Journey context: ${memoryContext}. Keep fiction distinct from historical fact; do not add unsupported facts. Return JSON only: {"story":"95-115 words","imagePrompt":"one concise visual-art prompt, max 45 words"}. Make the story emotionally specific and easy to read.`;
    const parts=await generateWithGemini(model,[{text:prompt}],{responseMimeType:'application/json',temperature:0.65,maxOutputTokens:320});
    const raw=parts.find(p=>p.text)?.text;
    if(!raw)throw new Error('Gemini did not return the chapter JSON.');
    const result=JSON.parse(raw);
    if(typeof result.story!=='string'||typeof result.imagePrompt!=='string')throw new Error('Gemini returned an invalid chapter.');
    return NextResponse.json({story:result.story.trim(),imagePrompt:result.imagePrompt.trim()});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid request'},{status:502});}
}
