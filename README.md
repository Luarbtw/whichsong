# Playlist Quiz

Quiz musical em React, TypeScript, Vite e Tailwind CSS. O jogo tem uma playlist fictícia local e pode importar playlists públicas e álbuns do Deezer.

## Rodar localmente

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Cole o link de uma playlist pública ou de um álbum do Deezer na tela inicial. O proxy definido no Vite encaminha as chamadas da aplicação local para a API pública do Deezer, evitando chamadas cross-origin bloqueadas pelo navegador.

## Limites do modo Deezer

- O importador lê playlists públicas. Playlists privadas exigiriam acesso OAuth/app aprovado pela Deezer.
- A API e a disponibilidade de cadastros de novos apps podem mudar. Se a Deezer bloquear o endpoint ou exigir aprovação para seu uso, será necessário solicitar acesso à equipe de desenvolvedores; o projeto não usa endpoints internos nem scraping.
- A Deezer exige aprovação antes de disponibilizar online aplicações que usam sua API. Este setup é para desenvolvimento local e uso pessoal; consulte os termos da Deezer antes de publicar ou permitir acesso a outras pessoas.
- Algumas faixas não têm preview. O jogo informa quando o áudio não está disponível e oferece o link da faixa na Deezer após a resposta. Quando disponível, o preview é interrompido pelo jogo após três segundos.
- Para produção, substitua o proxy de desenvolvimento do Vite por um endpoint de backend próprio, configurado para encaminhar as chamadas à API Deezer.

## Estrutura

- `src/services/deezer.ts`: leitura de playlist, paginação, validação do link e normalização de faixas.
- `src/hooks/useAudioPreview.ts`: reprodução de previews por três segundos e áudio sintetizado para a playlist demo.
- `src/data/demoPlaylist.ts`: playlist fictícia local.
- `src/App.tsx`: telas e fluxo do quiz.
