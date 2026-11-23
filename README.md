# Whichsong?

Um jogo de reconhecimento musical feito com React, TypeScript e Vite. Cole o link de uma playlist ou de um álbum público do Deezer, ou experimente a playlist de demonstração, e tente reconhecer as faixas ouvindo trechos curtos. Me baseei em um antigo joguinho que tinha no Facebook cujo nome não me recordo. Tentei muito fazer a integração com a API do spotify mas aparentemente eles tiraram rota de preview das músicas, então recorri ao Deezer e sinceramente supriu muito bem minha necessidade.

## Como jogar

1. Cole o link de uma playlist pública ou de um álbum do Deezer.
2. Escolha a duração do trecho, de 1 a 6 segundos.
3. Ouça cada trecho e escolha a música correta entre quatro opções.
4. Veja sua pontuação ao final da partida, com até 30 rodadas.

Também é possível iniciar uma partida com a playlist de demonstração, sem fornecer um link do Deezer, mas é mais pra ver como funciona o jogo e as "músicas" são só uns sons de bip genéricos.

## Funcionalidades

- Importação de playlists públicas e álbuns do Deezer.
- Reprodução de previews disponíveis, limitada à duração escolhida.
- Escolha de trechos de 1 a 6 segundos antes da partida.
- Quantidade ajustável de 5 a 30 rodadas, com quatro opções de música e artista.
- Controle de volume para os previews e o áudio da demonstração.
- Playlist de demonstração com 30 faixas fictícias e áudio sintetizado.
- Interface responsiva em português.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

## Executar localmente

Requer Node.js e npm instalados.

```bash
git clone https://github.com/SEU-USUARIO/whichsong.git
cd whichsong
npm install
npm run dev
```

Abra no navegador o endereço local mostrado pelo Vite no terminal. Não é necessário configurar credenciais ou arquivo `.env` para executar o projeto localmente.

## Build de produção

```bash
npm run build
npm run preview
```

O comando de build gera os arquivos estáticos na pasta `dist/`. O `npm run preview` serve essa build localmente para conferência.

## Integração com o Deezer

Durante o desenvolvimento, o servidor do Vite encaminha as requisições de `/api/deezer` para `https://api.deezer.com`, evitando que o navegador faça a chamada diretamente para outro domínio. Essa configuração está em `vite.config.ts` e funciona no servidor local do Vite.

A aplicação usa apenas playlists públicas e álbuns. Playlists privadas não são suportadas. A disponibilidade de previews depende da faixa e do retorno do Deezer; algumas músicas podem não ter um trecho disponível.

## Estrutura principal

```text
src/
├── data/demoPlaylist.ts       # Playlist fictícia para demonstração
├── hooks/useAudioPreview.ts   # Reprodução e interrupção dos trechos
├── services/deezer.ts         # Importação de playlists e álbuns
├── App.tsx                    # Telas e fluxo do jogo
└── style.css                  # Estilos da aplicação
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite |
| `npm run build` | Verifica os tipos e gera a build de produção |
| `npm run preview` | Serve localmente a build de produção |
