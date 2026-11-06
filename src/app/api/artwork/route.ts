import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

const schema=z.object({prompt:z.string().min(10).max(4000)});
export async function POST(req:Request){
  try{
    const {prompt}=schema.parse(await req.json());
    const parts=await generateWithGemini(process.env.GEMINI_IMAGE_MODEL||'gemini-3.1-flash-image',[{text:`Create a museum-quality personal artwork based on this art direction: ${prompt}. Make the image visually coherent, richly detailed and appropriate to its historical art movement. No text, lettering, logos or watermark-like graphics.`}],{responseModalities:['IMAGE'],responseFormat:{image:{aspectRatio:'1:1',imageSize:'1K'}}});
    const image=parts.find(p=>p.inlineData?.data)?.inlineData;
    if(!image?.data)return NextResponse.json({error:'Gemini returned no artwork image.'},{status:502});
    return NextResponse.json({dataUrl:`data:${image.mimeType||'image/png'};base64,${image.data}`});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Image generation failed'},{status:400});}
}