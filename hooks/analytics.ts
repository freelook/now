import RGA from 'react-ga';

const GA_INIT_FLAG = 'GA_INITIALIZED';

export const init = () => {
  RGA.initialize('UA-57893328-1');
};

export const log = () => {
  const w = window as any;
  const page = w.location.href;
  if (!w[GA_INIT_FLAG]) {
    init();
    w[GA_INIT_FLAG] = true;
  }
  RGA.set({ page });
  RGA.pageview(page);
};
