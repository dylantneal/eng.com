import { redirect } from 'next/navigation';

export default function GalleryRedirect() {
  // Permanently redirect /gallery to the new /projects page
  redirect('/projects');
} 