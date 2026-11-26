import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Music2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { demoPlaylist } from './data/demoPlaylist';
import { useAudioPreview } from './hooks/useAudioPreview';
import { extractDeezerCollection, importDeezerCollection } from './services/deezer';
import CRTWarp from './components/CRTWarp';
import StarBorder from './components/StarBorder';
import type { Playlist, Track } from './types';

const MAX_ROUNDS = 30;
type Round = { answer: Track; choices: Track[] };
type Screen = 'home' | 'game' | 'results';

function BackgroundLayer() {
  return (
    <div className="background-layer" aria-hidden="true">
      <CRTWarp
        color="#5767fc"
        backgroundColor="#090a2a"
        brightness={0.55}
        bloom={0.8}
        rgbShift={0.005}
        noise={0}
        flicker={0}
        interference={0}
        mask="none"
        curvature={0.3}
        persistence={0.53}
        speed={0.3}
        variation={2}
        waveAmplitude={1}
        waveFrequency={3}
        columns={200}
        scanlineStrength={0.29}
        bloomRadius={1.3}
        mouseReact={false}
        changeOnClick={false}
        dpr={1}
        fps={30}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

function VolumeControl({ volume, onChange }: { volume: number; onChange: (volume: number) => void }) {
  return (
    <label className="volume-control" title="Ajustar volume">
      {volume === 0 ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        style={{ '--range-value': `${volume}%` } as React.CSSProperties}
        onChange={event => onChange(Number(event.target.value))}
        aria-label="Volume"
        aria-valuetext={`${volume}%`}
      />
      <span>{volume}%</span>
    </label>
  );
}

function makeRounds(tracks: Track[], requestedRounds: number): Round[] {
  const pool = tracks.filter(track => track.previewUrl || track.demoAudio);
  const rounds: Round[] = [];
  for (let i = 0; i < Math.min(requestedRounds, pool.length); i++) {
    const answer = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const distractors = tracks.filter(track => track.id !== answer.id).sort(() => Math.random() - 0.5).slice(0, 3);
    rounds.push({ answer, choices: [answer, ...distractors].sort(() => Math.random() - 0.5) });
  }
  return rounds;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [playlist, setPlaylist] = useState<Playlist>(demoPlaylist);
  const [roundCount, setRoundCount] = useState(10);
  const [volume, setVolume] = useState(15);
  const [link, setLink] = useState('');
  const [clipSeconds, setClipSeconds] = useState(3);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const audio = useAudioPreview();
  const round = rounds[index];
  const chosen = answers[index] ?? null;
  const correct = useMemo(() => answers.filter((id, i) => id && id === rounds[i]?.answer.id).length, [answers, rounds]);

  function start(list: Playlist, requestedRounds = roundCount) {
    audio.stop();
    const nextRounds = makeRounds(list.tracks, requestedRounds);
    if (!nextRounds.length) {
      setNotice('Não há previews disponíveis nesta seleção. Tente outra playlist ou o modo demo.');
      return;
    }
    setPlaylist(list);
    setRounds(nextRounds);
    setAnswers([]);
    setIndex(0);
    setNotice('');
    setScreen('game');
  }

  async function importLink() {
    if (!link.trim()) {
      setNotice('Cole o link de uma playlist ou álbum para começar.');
      return;
    }
    setNotice('');
    setLoading(true);
    try {
      extractDeezerCollection(link);
      const imported = await importDeezerCollection(link);
      if (!imported.tracks.some(track => track.previewUrl)) {
        throw new Error('Esta seleção não tem previews disponíveis. Tente outro álbum ou playlist.');
      }
      start(imported);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível carregar essa seleção do Deezer.');
    } finally {
      setLoading(false);
    }
  }

  function answer(id: string) {
    if (chosen) return;
    audio.stop();
    setAnswers(previous => {
      const next = [...previous];
      next[index] = id;
      return next;
    });
  }

  function next() {
    audio.stop();
    if (index === rounds.length - 1) setScreen('results');
    else setIndex(current => current + 1);
  }

  function goHome() {
    audio.stop();
    setScreen('home');
  }

  if (screen === 'home') {
    return (
      <main className="landing">
        <BackgroundLayer />
        <VolumeControl volume={volume} onChange={setVolume} />
        <div className="landing-glow" aria-hidden="true" />
        <section className="landing-content">
          <p className="landing-kicker">UM JOGO DE OUVIDO</p>
          <h1>Whichsong<span>?</span></h1>
          <p className="landing-intro">Será que você reconhece a música?</p>

          <div className="how-to-play" aria-label="Como jogar">
            <div className="how-step"><span>01</span><p>Ouça um trecho<br /><b>de {clipSeconds} {clipSeconds === 1 ? 'segundo' : 'segundos'}</b></p></div>
            <div className="step-divider" />
            <div className="how-step"><span>02</span><p>Escolha entre<br /><b>4 músicas</b></p></div>
            <div className="step-divider" />
            <div className="how-step"><span>03</span><p>Marque pontos<br /><b>e siga o jogo</b></p></div>
          </div>

          <div className="duration-control">
            <label htmlFor="clip-duration">DURAÇÃO DO TRECHO <strong>{clipSeconds} {clipSeconds === 1 ? 'segundo' : 'segundos'}</strong></label>
            <input
              id="clip-duration"
              type="range"
              min="1"
              max="6"
              step="1"
              value={clipSeconds}
              style={{ '--range-value': `${((clipSeconds - 1) / 5) * 100}%` } as React.CSSProperties}
              onChange={event => setClipSeconds(Number(event.target.value))}
              aria-valuetext={`${clipSeconds} ${clipSeconds === 1 ? 'segundo' : 'segundos'}`}
            />
            <div className="duration-values" aria-hidden="true"><span>1s</span><span>2s</span><span>3s</span><span>4s</span><span>5s</span><span>6s</span></div>
          </div>

          <div className="extra-settings">
            <div className="duration-control compact-setting">
              <label htmlFor="round-count">QUANTIDADE DE RODADAS <strong>{roundCount}</strong></label>
              <input
                id="round-count"
                type="range"
                min="5"
                max={MAX_ROUNDS}
                step="1"
                value={roundCount}
                style={{ '--range-value': `${((roundCount - 5) / (MAX_ROUNDS - 5)) * 100}%` } as React.CSSProperties}
                onChange={event => setRoundCount(Number(event.target.value))}
                aria-valuetext={`${roundCount} rodadas`}
              />
              <div className="duration-values" aria-hidden="true"><span>5</span><span>30</span></div>
            </div>
          </div>

          <form className="playlist-form" onSubmit={event => { event.preventDefault(); void importLink(); }}>
            <label htmlFor="playlist-link">SUA PLAYLIST OU ÁLBUM</label>
            <StarBorder
              as="div"
              className="playlist-star-border"
              color="#5767fc"
              trailColor="#aeb8ff"
              backgroundColor="#141522"
              textColor="#f5f2fa"
              borderColor="rgba(87, 103, 252, .3)"
              duration={3.5}
              thickness={2}
              radius={27}
              trailLength={0.28}
              glow={0.55}
              hover="lap"
              style={{}}
            >
              <div className="input-wrap">
                <Music2 size={18} aria-hidden="true" />
                <input
                  id="playlist-link"
                  aria-label="Link de playlist ou álbum do Deezer"
                  placeholder="Cole aqui seu link do Deezer"
                  value={link}
                  onChange={event => { setLink(event.target.value); setNotice(''); }}
                />
                <button type="submit" aria-label="Começar jogo" disabled={loading}>
                  {loading ? <span className="spinner" /> : <ArrowRight size={19} />}
                </button>
              </div>
            </StarBorder>
            <div className="form-note"><span className="deezer-dot" /> Playlists públicas e álbuns do Deezer</div>
          </form>

          {notice && <div className="landing-notice" role="alert">{notice}</div>}
          <button className="demo-link" onClick={() => start(demoPlaylist)}>
            ou experimentar a playlist de demonstração <ArrowRight size={13} />
          </button>
        </section>
        <footer className="landing-footer"><span>FEITO PARA QUEM OUVE DE VERDADE</span><span>{roundCount} RODADAS · SEM REPETIÇÕES</span></footer>
      </main>
    );
  }

  if (screen === 'results') {
    const percentage = rounds.length ? Math.round(correct / rounds.length * 100) : 0;
    return (
      <main className="app-shell results-screen">
        <BackgroundLayer />
        <header className="game-header">
          <button className="wordmark" onClick={goHome}>Whichsong<span>?</span></button>
          <div className="header-actions"><VolumeControl volume={volume} onChange={setVolume} /><button className="quiet-button" onClick={goHome}><ArrowLeft size={15} /> Início</button></div>
        </header>
        <section className="results-content">
          <div className="results-kicker">FIM DE JOGO <span>·</span> {playlist.name}</div>
          <div className="result-orb"><Music2 size={25} /></div>
          <h1>{percentage >= 80 ? 'Ouvido de ouro.' : percentage >= 50 ? 'Você tem ritmo.' : 'A música te espera.'}</h1>
          <p>Você reconheceu {correct} de {rounds.length} trechos.</p>
          <div className="score-ring" style={{ '--pct': `${percentage}%` } as React.CSSProperties}>
            <div><strong>{percentage}<small>%</small></strong><span>DE ACERTO</span></div>
          </div>
          <div className="result-stats">
            <div><strong>{correct * 100}</strong><span>PONTOS</span></div>
            <div><strong>{rounds.length - correct}</strong><span>ERROS</span></div>
            <div><strong>{rounds.length}</strong><span>RODADAS</span></div>
          </div>
          <button className="main-cta replay-cta" onClick={() => start(playlist)}><RotateCcw size={16} /> Jogar novamente</button>
          <button className="back-link" onClick={goHome}>Voltar ao início</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell game-screen">
      <BackgroundLayer />
      <header className="game-header">
        <button className="wordmark" onClick={goHome}>Whichsong<span>?</span></button>
        <div className="header-center">{playlist.name}</div>
        <div className="header-actions"><VolumeControl volume={volume} onChange={setVolume} /><button className="quiet-button" onClick={goHome}><X size={15} /> Sair</button></div>
      </header>

      <section className="quiz-wrap">
        <div className="round-line">
          <span>RODADA <b>{String(index + 1).padStart(2, '0')}</b><i> / {String(rounds.length).padStart(2, '0')}</i></span>
          {playlist.deezerUrl && <a href={playlist.deezerUrl} target="_blank" rel="noreferrer">DEEZER <ExternalLink size={11} /></a>}
        </div>
        <div className="progress-track"><div style={{ width: `${((index + (chosen ? 1 : 0)) / rounds.length) * 100}%` }} /></div>

        <div className="quiz-center">
          <p className="quiz-prompt">QUAL É ESSA MÚSICA?</p>
          <button
            className={`play-disc ${audio.playing ? 'is-playing' : ''}`}
            disabled={!!chosen}
            onClick={() => audio.play(round.answer, clipSeconds, volume / 100)}
            aria-label={audio.playing ? 'Reproduzindo trecho' : 'Reproduzir trecho'}
          >
            {audio.playing ? <Pause size={27} fill="currentColor" /> : <Play size={27} fill="currentColor" />}
          </button>
          <div className={`waveform ${audio.playing ? 'active' : ''}`} aria-hidden="true">
            {Array.from({ length: 31 }, (_, i) => <i key={i} style={{ '--h': `${8 + (Math.sin(i * 2.2) * .5 + .5) * 28}px`, '--d': `${i % 10 * .045}s` } as React.CSSProperties} />)}
          </div>
          <p className="play-caption">{audio.playing ? 'ESCUTE COM ATENÇÃO' : `TRECHO DE ${clipSeconds} ${clipSeconds === 1 ? 'SEGUNDO' : 'SEGUNDOS'} · TOQUE PARA OUVIR`}</p>
          {audio.error && <p className="audio-error" role="status">{audio.error}</p>}

          <div className="answers-grid">
            {round.choices.map((track, i) => {
              const isCorrect = track.id === round.answer.id;
              const isChosen = chosen === track.id;
              const state = chosen ? (isCorrect ? 'correct' : isChosen ? 'wrong' : 'dimmed') : '';
              return (
                <button key={track.id} className={`answer-card ${state}`} disabled={!!chosen} onClick={() => answer(track.id)}>
                  <span className="answer-index">0{i + 1}</span>
                  <span className="answer-copy"><b>{track.name}</b><small>{track.artist}</small></span>
                  {chosen && isCorrect && <Check className="answer-state" size={19} />}
                  {chosen && isChosen && !isCorrect && <X className="answer-state" size={19} />}
                </button>
              );
            })}
          </div>

          {chosen && (
            <div className={`answer-feedback ${chosen === round.answer.id ? 'good' : 'miss'}`}>
              <div className="feedback-copy">
                <b>{chosen === round.answer.id ? 'Acertou em cheio.' : 'Dessa vez não.'}</b>
                <span>A música era <strong>{round.answer.name}</strong> · {round.answer.artist}</span>
                {round.answer.deezerUrl && <a href={round.answer.deezerUrl} target="_blank" rel="noreferrer">Abrir no Deezer <ExternalLink size={12} /></a>}
              </div>
              <button className="next-button" onClick={next}>{index === rounds.length - 1 ? 'Ver resultado' : 'Próxima'} <ArrowRight size={16} /></button>
            </div>
          )}
        </div>

        <div className="game-bottom"><span><b>{correct * 100}</b> PTS</span><div className="round-dots">{rounds.map((_, i) => <i key={i} className={`${i < index ? 'done' : ''} ${i === index ? 'current' : ''}`} />)}</div><span>SEM REPETIÇÕES</span></div>
      </section>
    </main>
  );
}
