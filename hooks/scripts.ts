import RGA from 'react-ga';
import * as render from 'hooks/render';

const SRC_INIT_FLAG = 'FLI_SRC_INITIALIZED';

export const init = () => {
  RGA.initialize('UA-57893328-1');
  render.load('facebook-jssdk', 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v6.0&appId=846841298681206');
  render.load('adsbygoogle', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
    "data-ad-client": "ca-pub-2500456856779147"
  });
};

export const load = () => {
  const w = window as any;
  const page = w.location.href;
  if (!w[SRC_INIT_FLAG]) {
    init();
    w[SRC_INIT_FLAG] = true;
  }
  RGA.set({ page });
  RGA.pageview(page);
};
