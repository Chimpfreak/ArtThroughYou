import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

export const maxDuration = 15;
const schema=z.object({
  era:z.object({name:z.string(),period:z.string(),intro:z.string(),scene:z.string(),style:z.string(),fact:z.string(),choices:z.array(z.object({title:z.string(),description:z.string(),consequence:z.string()}))}),
  visitorName:z.string().max(40),
  memory:z.object({personality:z.string(),theme:z.string(),symbols:z.array(z.string()),thread:z.array(z.string()),summary:z.string()}),
  previousQuestions:z.array(z.string().max(500)).max(10).optional()
});
export async function POST(req:Request){
  try{
    const body=schema.parse(await req.json());
    const prompt=`Ask one original reflective question (max 20 words) for ${body.visitorName} entering ${body.era.name} (${body.era.period}). Scene: ${body.era.scene}. Their theme: ${body.memory.theme}; symbols: ${body.memory.symbols.slice(0,2).join(', ')}. Choices: ${body.era.choices.map(c=>c.title).join(', ')}. Avoid these previous questions: ${(body.previousQuestions||[]).slice(-4).join(' | ')}. Return JSON only: {"question":"..."}.`;
    const parts=await generateWithGemini(process.env.GEMINI_MODEL||'gemini-3.1-flash-lite',[{text:prompt}],{responseMimeType:'application/json',temperature:0.7,maxOutputTokens:80});
    const raw=parts.find(p=>p.text)?.text;
    if(!raw)throw new Error('Gemini returned no question.');
    const result=JSON.parse(raw);
    if(typeof result.question!=='string'||!result.question.trim())throw new Error('Gemini returned an invalid question.');
    return NextResponse.json({question:result.question.trim()});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Question generation failed.'},{status:502});}
}
