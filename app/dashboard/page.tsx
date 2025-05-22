import { redirect } from 'next/navigation';

/* keep the old URL working – immediately send users to /home */
export default function Dashboard() {
  redirect('/home');
} 