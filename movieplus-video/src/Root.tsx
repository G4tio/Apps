import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Intro, INTRO_DUR} from './Intro';
import {Cierre, CIERRE_DUR} from './Cierre';
import {MoviePlusNews, NEWS_DUR} from './MoviePlusNews';
import {W, H, FPS} from './marca';

const fuentes: [string, string, FontFaceDescriptors][] = [
  ['Saira Condensed', 'fonts/SairaCondensed-Black.ttf', {weight: '900'}],
  ['Saira Condensed', 'fonts/SairaCondensed-Bold.ttf', {weight: '700'}],
  ['Montserrat', 'fonts/Montserrat.ttf', {weight: '100 900'}],
  ['Montserrat', 'fonts/Montserrat-Italic.ttf', {weight: '100 900', style: 'italic'}],
];
const h = delayRender('fuentes');
Promise.all(
  fuentes.map(([fam, src, d]) =>
    new FontFace(fam, `url(${staticFile(src)})`, d).load().then((ff) => document.fonts.add(ff)),
  ),
).then(() => continueRender(h));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={INTRO_DUR} fps={FPS} width={W} height={H} />
    <Composition id="Cierre" component={Cierre} durationInFrames={CIERRE_DUR} fps={FPS} width={W} height={H} />
    <Composition id="MoviePlusNews" component={MoviePlusNews} durationInFrames={NEWS_DUR} fps={FPS} width={W} height={H} />
  </>
);
