import { createClient } from '@/lib/supabase/server'; // Adjust path if you use an alias like @/utils/supabase-server
import { revalidatePath } from 'next/cache';
// import { cookies } from 'next/headers'; // No longer needed here, createClient handles it

export const metadata = {
  title: 'Q&A — eng.com',
};

// Server Action to create a new question
async function createQuestion(formData: FormData) {
  'use server';

  // const cookieStore = cookies(); // Not needed
  const supabase = await createClient(); // Must await, and no argument needed

  // Or if your createClient is already wrapped like in the provided lib/supabase/server.ts:
  // const supabase = await createClient(); // Assuming your lib/supabase/server.ts createClient is async due to cookies()

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated user - redirect or throw error
    // For simplicity, we'll assume user is authenticated for this action
    // In a real app, protect this action or the form display
    console.error('User not authenticated');
    // Server actions used directly in `action` prop should not return values
    // like this unless used with useFormState.
    // Consider throwing an error or redirecting.
    // For now, just return to stop execution.
    return;
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  // const tags = formData.get('tags') as string; // Future: handle tags

  if (!title || !content) {
    console.error('Title and content are required.');
    // Similarly, handle error appropriately for a direct form action.
    return;
  }

  const { error } = await supabase.from('comments').insert({
    user_id: user.id,
    body: `# ${title}\n\n${content}`, // Use 'body' instead of 'content'
    kind: 'question',
    // Add other relevant fields like parent_id (null for new questions)
  });

  if (error) {
    console.error('Error creating question:', error);
    // Handle error appropriately.
    return;
  }

  revalidatePath('/qna'); // Revalidate the Q&A page to show the new question
  // redirect('/qna'); // Optionally redirect on success
  // No explicit return needed if action is void
}

// Define a type for the question object based on your select query
type QuestionType = {
  id: string;
  body: string | null;
  created_at: string | null;
  user_id: string | null;
};

export default async function QnAPage() {
  const supabase = await createClient();

  const { data: questions, error: questionsError } = await supabase
    .from('comments')
    .select(`
      id,
      body,
      created_at,
      user_id
    `)
    .eq('kind', 'question')
    .order('created_at', { ascending: false });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
  }

  // Fetch user profiles separately if needed
  const userIds = questions?.map(q => q.user_id).filter((id): id is string => id !== null) || [];
  const { data: profiles } = userIds.length > 0 
    ? await supabase
        .from('profiles')
        .select('id, handle, avatar_url')
        .in('id', userIds)
    : { data: [] };

  // Create a map for quick lookup
  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return (
    <main className="container mx-auto max-w-4xl py-12 space-y-8">
      <h1 className="text-3xl font-bold">Q&A</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
        <form action={createQuestion} className="space-y-4 p-4 border rounded-lg bg-card">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-muted-foreground">Your Question</label>
            <textarea
              name="content"
              id="content"
              rows={5}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Describe your question in detail..."
            />
          </div>
          {/* Future: Add tags input */}
          {/* <input type="text" name="tags" placeholder="Tags (comma-separated)" /> */}
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90"
          >
            Post Question
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Questions</h2>
        <div className="space-y-6">
          {questions && questions.length > 0 ? (
            questions.map((q) => {
              const userProfile = q.user_id ? profilesMap.get(q.user_id) : null;
              return (
                <div key={q.id} className="p-4 border rounded-lg bg-card shadow">
                  <h3 className="text-xl font-semibold mb-2">
                    {/* Extract title from body or have a separate title field */}
                    {q.body?.split('\n\n')[0].replace(/^# /, '') || 'Untitled Question'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Asked by {userProfile?.handle || 'Anonymous'} on {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Unknown date'}
                  </p>
                  <pre className="mt-2 text-sm whitespace-pre-wrap bg-muted p-2 rounded">{q.body}</pre>
                  {/* Add link to question detail page: /qna/[id] */}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
          )}
        </div>
      </section>
    </main>
  );
} 