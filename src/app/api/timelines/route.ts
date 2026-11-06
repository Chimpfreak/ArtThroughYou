import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini } from '@/lib/gemini';

export const runtime='nodejs';
const schema=z.object({
  portrait:z.string().max(12_000_000).regex(/^data:image\/(png|jpeg|webp);base64,/),
  name:z.string().min(1).max(50),
  chapters:z.record(z.string(),z.object({choiceTitle:z.string().max(120).optional(),story:z.string().max(1500).optional()})).optional(),
  memory:z.object({theme:z.string().max(100).optional(),summary:z.string().max(1000).optional(),thread:z.array(z.string().max(300)).max(10).optional()}).optional()
});
export async function POST(req:Request){
  try{
    const input=schema.parse(await req.json());
    const match=input.portrait.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if(!match)return NextResponse.json({error:'Unsupported portrait format.'},{status:400});
    const mime=match[1];
    const imageData=match[2];
    const choices=Object.values(input.chapters||{}).map(c=>c.choiceTitle).filter(Boolean).join('; ');
    const context=[choices,input.memory?.theme,input.memory?.summary,...(input.memory?.thread||[])].filter(Boolean).join('. ').slice(0,3000);
    const prompt=`Use the uploaded photograph as the identity reference for the same person in every panel. Create ONE polished, high-resolution landscape 2-by-2 contact sheet with four equal portrait scenes, clearly separated by composition but no borders, captions, lettering, logos or watermarks. Preserve the person's recognisable facial identity, facial proportions, skin tone and age consistently in all four panels. These are four parallel lives inspired by ${input.name}'s actual choices: ${context||'curiosity, connection, creativity and discovery'}. Panel 1 THE KEEPER: a life shaped by memory, roots and preserving what matters. Panel 2 THE EXPLORER: a life of travel, discovery and brave new directions. Panel 3 THE CREATOR: a life devoted to making, invention and expressive work. Panel 4 THE CONNECTOR: a life built around community, collaboration and meaningful relationships. Give each scene its own coherent wardrobe, environment, lighting and visual mood while keeping the person unmistakably the same. Sophisticated editorial portrait photography with subtle fine-art influence, natural anatomy and believable environments. Four distinct timelines of one person, not four unrelated people.`;
    const parts=await generateWithGemini(process.env.GEMINI_IMAGE_MODEL||'gemini-3.1-flash-image',[
      {text:prompt},
      {inline_data:{mime_type:mime,data:imageData}}
    ],{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9',imageSize:'2K'}});
    const image=parts.find(p=>p.inlineData?.data)?.inlineData;
    if(!image?.data)return NextResponse.json({error:'Gemini returned no four-timeline image.'},{status:502});
    return NextResponse.json({dataUrl:`data:${image.mimeType||'image/png'};base64,${image.data}`});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Timeline generation failed.'},{status:400});}
}