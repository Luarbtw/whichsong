import type { Playlist, Track } from '../types';
const entries: [string,string,string,string][] = [
 ['Afterglow Avenue','Luna Vale','Soft Focus','#d45e88'], ['Velvet Static','The Paper Moons','Night Signals','#6068d8'], ['Blue Hour','Milo June','Somewhere Close','#388aaf'], ['Little by Little','June Holiday','Open Windows','#df9650'], ['Satellite Heart','Nova Bloom','Orbiting','#875bd0'],
 ['Sunday Cinema','The Slow Parade','Ordinary Magic','#d17553'], ['Glasshouse','Mira Sol','Soft Focus','#6d9c7d'], ['Anywhere, Anyway','Golden Days','Open Windows','#d2a844'], ['City in a Dream','Atlas & June','Night Signals','#4886a7'], ['Almost Home','Romy Lane','Somewhere Close','#c26e88'],
 ['Honeylight','Sundaze Club','Ordinary Magic','#dc9c5d'], ['Polaroid Summer','Luna Vale','Open Windows','#6fa7a0'], ['Paper Planes','Milo June','Somewhere Close','#7772b7'], ['Low Tide','Mira Sol','Soft Focus','#528c95'], ['Wildflower Season','Nova Bloom','Orbiting','#a77d4c'],
 ['Dancing in Place','The Paper Moons','Night Signals','#c66765'], ['The Long Way','Golden Days','Open Windows','#698c68'], ['Moon on the Water','Romy Lane','Somewhere Close','#50719c'], ['Stay for the Song','June Holiday','Ordinary Magic','#d28265'], ['Quiet Thunder','Atlas & June','Night Signals','#7169aa']
];
const tracks: Track[] = entries.map(([name,artist,album,hue],i)=>({ id:`demo-${i+1}`, name, artist, album, hue, demoAudio:true, coverUrl:`https://images.unsplash.com/photo-${['1519608487953-e999c86e7455','1470225620780-dba8ba36b745','1519608487953-e999c86e7455','1500530855697-b586d89ba3ee'][i%4]}?auto=format&fit=crop&w=240&q=75` }));
export const demoPlaylist: Playlist = { id:'demo-mix', name:'Somewhere, after dark', description:'20 faixas fictícias para uma noite sem pressa.', tracks };
