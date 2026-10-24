/** Client-side coordinator: asks the server to write posts, three at a time. */
const running = new Set<string>();

export async function generatePost(postId: string) {
  if (running.has(postId)) return;
  running.add(postId);
  try { await fetch(`/api/posts/${postId}/generate`, { method: 'POST' }); }
  catch { /* the server marks the post as failed; the screen shows it on the next refresh */ }
  finally { running.delete(postId); }
}

export async function generateSet(posts: { id: string; status: string }[]) {
  const queue = posts.filter((p) => p.status === 'waiting' || p.status === 'writing').map((p) => p.id);
  await Promise.all([0, 1, 2].map(async () => { while (queue.length) await generatePost(queue.shift()!); }));
}
