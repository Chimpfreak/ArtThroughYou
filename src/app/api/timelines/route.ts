import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCloudflareImage } from '@/lib/cloudflare-ai';

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
    const match=input.portrait.match(/^data:image\/(?:png|jpeg|webp);base64,(.+)$/);
    if(!match)return NextResponse.json({error:'Unsupported portrait format.'},{status:400});
    const imageData=match[1];
    const choices=Object.values(input.chapters||{}).map(c=>c.choiceTitle).filter(Boolean).join('; ');
    const context=[choices,input.memory?.theme,input.memory?.summary,...(input.memory?.thread||[])].filter(Boolean).join('. ').slice(0,2200);
    const prompt=`Create ONE polished landscape 2-by-2 contact sheet with four equal portrait scenes. Use the supplied photo as the visual identity reference: retain the same person's face, age, skin tone and recognisable features across all four panels. This is ${input.name}'s set of parallel lives, inspired by these choices and themes: ${context||'curiosity, connection, creativity and discovery'}. Panel 1 THE KEEPER: memory, roots and preserving what matters. Panel 2 THE EXPLORER: travel, discovery and brave new directions. Panel 3 THE CREATOR: making, invention and expressive work. Panel 4 THE CONNECTOR: community, collaboration and meaningful relationships. Distinct settings, wardrobe and lighting in each panel; clear quadrant composition; sophisticated editorial portrait photography; natural anatomy; believable environments. No borders, captions, lettering, logos or watermarks.`;
    const generated=await generateCloudflareImage(
      '@cf/runwayml/stable-diffusion-v1-5-img2img',
      {prompt,negative_prompt:'text, letters, watermark, logo, collage borders, extra faces, distorted anatomy, deformed hands',image_b64:imageData,width:768,height:512,num_steps:20,strength:0.62,guidance:7.5}
    );
    return NextResponse.json({dataUrl:`data:${generated.mimeType||'image/jpeg'};base64,${generated.image}`});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Timeline generation failed.'},{status:502});}
}
