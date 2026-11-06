import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

const schema=z.object({
  era:z.object({name:z.string(),period:z.string(),intro:z.string(),scene:z.string(),style:z.string(),fact:z.string(),choices:z.array(z.object({title:z.string(),description:z.string(),consequence:z.string()}))}),
  visitorName:z.string().max(40),
  memory:z.object({personality:z.string(),theme:z.string(),symbols:z.array(z.string()),thread:z.array(z.string()),summary:z.string()}),
  previousQuestions:z.array(z.string().max(500)).max(10).optional()
});
export async function POST(req:Request){
  try{
    const body=schema.parse(await req.json());
    const prompt=`Create one original, thought-provoking question for ${body.visitorName} as they enter the ${body.era.name} chapter (${body.era.period}). Scene: ${body.era.scene}. Artistic context: ${body.era.style}. Their journey so far: ${JSON.stringify(body.memory)}. Available paths: ${body.era.choices.map(c=>c.title+': '+c.description).join('; ')}. Avoid repeating these earlier questions or themes verbatim: ${(body.previousQuestions||[]).join(' | ')}. Ask one concise, emotionally engaging question (maximum 24 words) that invites personal reflection and makes the upcoming choices feel meaningful. It must be a real question, not a multiple-choice list, and must not assume personal facts. Return only JSON: {"question":"..."}.`;
    const parts=await generateWithGemini(process.env.GEMINI_MODEL||'gemini-3.8-flash',[{text:prompt}],{responseMimeType:'application/json',temperature:0.95});
    const raw=parts.find(p=>p.text)?.text;
    if(!raw)throw new Error('Gemini returned no question.');
    const result=JSON.parse(raw);
    if(typeof result.question!=='string'||!result.question.trim())throw new Error('Gemini returned an invalid question.');
    return NextResponse.json({question:result.question.trim()});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Question generation failed.'},{status:400});}
}