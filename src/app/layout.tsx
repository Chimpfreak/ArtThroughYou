import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title:'Art Through You — A story written in art', description:'Travel through five eras of art. Your choices shape the story; your symbols shape the images.' };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
