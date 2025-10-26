import { getEnvironmentConfig } from '@/lib/config';

export async function GET(req: Request) {
  const env = getEnvironmentConfig();
  const res = await fetch('https://api.github.com/repos/michaeltmk/portfolio', {
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
    },
  });

  if (!res.ok) {
    return new Response('Failed to fetch stars', { status: res.status });
  }

  const data = await res.json();
  return Response.json({ stars: data.stargazers_count });
}