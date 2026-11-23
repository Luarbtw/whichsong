import type { Playlist, Track } from '../types';

interface DeezerArtist { name?: string }
interface DeezerAlbum { title?: string; cover_medium?: string; cover_xl?: string }
interface DeezerTrack { id?: number; title?: string; preview?: string; link?: string; type?: string; artist?: DeezerArtist; album?: DeezerAlbum }
interface DeezerPage { data?: DeezerTrack[]; next?: string | null; error?: { message?: string; type?: string; code?: number } }
interface DeezerCollection { id?: number; title?: string; description?: string; link?: string; picture_xl?: string; picture_big?: string; cover_xl?: string; cover_big?: string; artist?: DeezerArtist; tracks?: DeezerPage; error?: { message?: string; type?: string; code?: number } }

export function extractDeezerCollection(input: string): { id: string; type: 'playlist' | 'album' } {
  const value = input.trim();
  const match = value.match(/(?:deezer\.com\/(?:[a-z]{2}\/)?(playlist|album)\/|deezer:(playlist|album):)(\d+)/i);
  if (!match) throw new Error('Cole um link válido de playlist pública ou álbum do Deezer.');
  return { id: match[3], type: (match[1] || match[2]).toLowerCase() as 'playlist' | 'album' };
}

async function requestDeezer<T>(path: string): Promise<T> {
  const url = new URL(path, window.location.origin);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`A API do Deezer respondeu com erro (${response.status}).`);
  const payload = await response.json() as T & { error?: { message?: string; code?: number } };
  if (payload.error) {
    const message = payload.error.code === 4
      ? 'O Deezer limitou as consultas. Aguarde um pouco e tente novamente.'
      : payload.error.message || 'O Deezer não conseguiu abrir essa playlist.';
    throw new Error(message);
  }
  return payload;
}

function nextProxyPath(next: string): string {
  const url = new URL(next);
  if (url.hostname !== 'api.deezer.com') throw new Error('A paginação retornou um endereço inesperado.');
  return `/api/deezer${url.pathname}${url.search}`;
}

export async function importDeezerCollection(input: string): Promise<Playlist> {
  const { id, type } = extractDeezerCollection(input);
  const path = `/api/deezer/${type}/${encodeURIComponent(id)}?output=json`;
  const collection = await requestDeezer<DeezerCollection>(path);
  if (!collection.id || !collection.title) throw new Error('Não foi possível ler esse álbum ou playlist. O link pode ser privado ou estar indisponível.');

  const tracks: Track[] = [];
  const appendTracks = (items: DeezerTrack[] = []) => items.forEach(item => {
    if (item.type === 'episode' || !item.id || !item.title) return;
    tracks.push({
      id: `deezer-${item.id}`,
      name: item.title,
      artist: item.artist?.name || 'Artista desconhecido',
      album: item.album?.title || 'Álbum desconhecido',
      coverUrl: item.album?.cover_xl || item.album?.cover_medium || '',
      previewUrl: item.preview || undefined,
      deezerUrl: item.link || `https://www.deezer.com/track/${item.id}`,
      hue: '#765bd3',
    });
  });
  appendTracks(collection.tracks?.data);
  let next: string | null = collection.tracks?.data?.length
    ? collection.tracks.next ?? null
    : `/api/deezer/${type}/${encodeURIComponent(id)}/tracks?limit=100&index=0&output=json`;
  let pages = 0;
  while (next && tracks.length < 1000 && pages < 12) {
    const page = await requestDeezer<DeezerPage>(next.startsWith('/api/deezer/') ? next : nextProxyPath(next));
    appendTracks(page.data);
    next = page.next ?? null;
    pages++;
  }

  const uniqueTracks = [...new Map(tracks.map(track => [track.id, track])).values()];
  if (uniqueTracks.length < 4) throw new Error('O álbum ou playlist precisa ter pelo menos 4 faixas disponíveis para iniciar o quiz.');
  return {
    id: `deezer-${type}-${collection.id}`,
    name: collection.title,
    description: collection.description || `${type === 'album' ? 'Álbum' : 'Playlist'}${collection.artist?.name ? ` de ${collection.artist.name}` : ''}, importado do Deezer.`,
    tracks: uniqueTracks,
    deezerUrl: collection.link || `https://www.deezer.com/${type}/${id}`,
    imageUrl: collection.picture_xl || collection.picture_big || collection.cover_xl || collection.cover_big,
    source: 'deezer',
    collectionType: type,
  };
}
