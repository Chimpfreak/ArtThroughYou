import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
const schema=z.object({prompt:z.string().min(10).max(4000)});
export async function POST(req:Request){try{const {prompt}=schema.parse(await req.json());if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'OPENAI_API_KEY is not configured'},{status:503});const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});const result=await client.images.generate({model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-1',prompt:`Create a museum-quality personal artwork. ${prompt}. No text, no watermark.`,size:'1024x1024'});const b64=result.data?.[0]?.b64_json;if(!b64)return NextResponse.json({error:'No image returned'},{status:502});return NextResponse.json({dataUrl:`data:image/png;base64,${b64}`});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Image generation failed'},{status:400});}}
