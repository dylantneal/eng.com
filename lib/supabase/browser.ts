// Lightweight wrapper so legacy imports (`@/lib/supabase/browser`) keep working.
// It re-exports the `supabaseBrowser` singleton and also provides a
// `createBrowserClient()` factory that simply returns that same client.

import { supabaseBrowser } from './client';

export const createBrowserClient = () => supabaseBrowser;
export { supabaseBrowser };