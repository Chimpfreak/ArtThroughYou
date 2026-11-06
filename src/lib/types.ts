import type { Era } from './eras';
export type Memory = { personality:string; theme:string; symbols:string[]; thread:string[]; summary:string };
export type ChapterResult = { story:string; situation:string; choices:Era['choices']; memory:Memory; imagePrompt:string };
export type Artwork = { eraId:number; dataUrl?:string; imageUrl?:string; prompt:string; createdAt:string };
export type Journey = { id:string; name:string; currentEra:number; completed:boolean; memory:Memory; chapters:Record<number,{choiceId:string;choiceTitle:string;story:string}>; artworks:Record<number,Artwork>; createdAt:string };
export const initialMemory = ():Memory => ({personality:'',theme:'',symbols:[],thread:[],summary:'A new journey through the history of art.'});
