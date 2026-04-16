import type { Metadata } from "next";

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${params.username}'s Digital Card`,
    description: `View ${params.username}'s digital business card`,
  };
}

export default function PublicCardPage({ params }: PageProps) {
  return (
    <main>
      <p>Public card view for: {params.username}</p>
      {/* Card display — coming soon */}
    </main>
  );
}
