export interface Track { id: string; name: string; artist: string; album: string; coverUrl: string; previewUrl?: string; deezerUrl?: string; hue: string; demoAudio?: boolean; }
export interface Playlist { id: string; name: string; description: string; tracks: Track[]; deezerUrl?: string; imageUrl?: string; source?: 'demo' | 'deezer'; collectionType?: 'playlist' | 'album'; }
