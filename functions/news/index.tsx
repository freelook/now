import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { Segment, Icon } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'functions';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import * as render from 'hooks/render';
import { useWebtask, RSS_TASK } from 'hooks/webtask';

export const config = { amp: 'hybrid' };

export const NEWS_LOCALES = {
    [locale.EN]: 'en',
    [locale.ES]: 'es',
    [locale.DE]: 'de',
    [locale.FR]: 'fr',
    [locale.IT]: 'it',
    [locale.PL]: 'pl',
    [locale.UK]: 'uk',
    [locale.RU]: 'ru',
    ['en.au']: 'en&gl=AU',
    ['en.ca']: 'en&gl=CA',
    ['fr.ca']: 'fr&gl=CA',
    ['en.gb']: 'en&gl=GB',
    ['uk.ua']: 'uk&gl=UA',
    ['ru.ua']: 'ru&gl=UA',
    ['ua']: 'uk',
} as {[key:string]:string};

interface NewsContext extends IndexContext {
    node?: string;
    slug?: string;
    page: number;
    news: INewsItem[];
}

export interface INewsItem {
    title: string;
    description: string; // html
    link: string;
    'rss:pubdate': {'#': string};
}

const News = (ctx:NewsContext) => {
  const input = useInput();
  const slug = _.get(ctx, 'slug', input || '');
  const titlePrefix = _.get(ctx, 't.News', 'News');
  const title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  const description = slug;

  return (
    <Layout head={{title: title, description: description, image: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} />
        </Segment>

        <Segment>
            <Grid<INewsItem> className='news'
                items={ctx.news}
                header={(n) => _.get(n, 'title')}
                meta={(n) => _.get(n, 'rss:pubdate.#')}
                image={(n) => {
                    const link = _.get(n, 'link');
                    return `/api/meta/img/${route.encode(link)}`;
                }}
                alt={(n) => _.get(n, 'title')}
                link={(n)=> {
                    const link = _.get(n, 'link');
                    return {href: `${PATH.META}/[token]`, as: `${PATH.META}/${route.encode(link)}`};
                }}
                extra={(n) => {
                    const link = _.get(n, 'link');
                    return (<Grid.Extra>
                        <Nav.External link={link}><Icon color='teal' circular name="external alternate"/></Nav.External>
                    </Grid.Extra>);
                }}/>
        </Segment>  

        <Footer {...{ctx}} />
    </Layout>
  );
};

News.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input', '');
  const slug = _.get(query, 'seo', input);
  const indexProps = await useIndexProps(ctx);
  const lang = NEWS_LOCALES[indexProps.locale] || NEWS_LOCALES[locale.getGeo(indexProps.locale)] || NEWS_LOCALES[locale.getLng(indexProps.locale)] || NEWS_LOCALES[locale.EN];
  const newsTask = useWebtask(ctx)({
    taskName: RSS_TASK, 
    body: {
        rss: `https://news.google.com/rss?hl=${lang}${input ? `&q=${render.encode(input)}` : ''}`
    },
    cache: true
  });
  const rss = (await newsTask || {}).rss
  if(_.isEmpty(rss)) {
    route.redirect(ctx).to(`${PATH.WEB}?input=${render.encode(input)}`);
  }
  return {
      name: 'News',
      ...indexProps,
      slug: slug,
      news: rss
  };
};

export default News;
