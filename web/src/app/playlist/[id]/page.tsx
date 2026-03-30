import { PlaylistPageClient } from "@/components/playlist-page-client";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlaylistPageClient id={id} />;
}
