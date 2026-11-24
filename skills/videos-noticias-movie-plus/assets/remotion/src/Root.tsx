import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {FUENTES_CSS} from './fuentes';
import {Intro, INTRO_DUR} from './Intro';
import {Cierre, CIERRE_DUR} from './Cierre';
import {MoviePlusNews, NEWS_DUR} from './MoviePlusNews';
import {W, H, FPS} from './marca';

// Fuentes incrustadas como data URI: cargan al instante, sin peticiones al servidor.
const estilo = document.createElement('style');
estilo.textContent = FUENTES_CSS;
document.head.appendChild(estilo);
const h = delayRender('fuentes', {timeoutInMilliseconds: 60000});
Promise.allSettled([
  document.fonts.load("900 italic 40px 'Saira Condensed'"),
  document.fonts.load("700 italic 40px 'Saira Condensed'"),
  document.fonts.load("600 40px 'Montserrat'"),
  document.fonts.load("900 40px 'Montserrat'"),
  document.fonts.load("400 40px 'Bebas Neue'"),
]).finally(() => continueRender(h));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={INTRO_DUR} fps={FPS} width={W} height={H} />
    <Composition id="Cierre" component={Cierre} durationInFrames={CIERRE_DUR} fps={FPS} width={W} height={H} />
    <Composition id="MoviePlusNews" component={MoviePlusNews} durationInFrames={NEWS_DUR} fps={FPS} width={W} height={H} />
  </>
);
