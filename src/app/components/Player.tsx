// src/app/components/Player.tsx
"use client";

interface PlayerProps {
  playlistUrl: string;
}

export default function Player({ playlistUrl }: PlayerProps) {
  if (!playlistUrl) return null;

  // Spotify embed link format:
  // https://open.spotify.com/embed/playlist/{playlistId}
  const embedUrl = playlistUrl.replace(
    "open.spotify.com/playlist/",
    "open.spotify.com/embed/playlist/"
  );

  return (
    <div className="mt-8 flex justify-center">
      <iframe
        src={embedUrl}
        width="300"
        height="380"
        style={{ display: "none" }}
        allow="encrypted-media"
      />
    </div>
  );
}