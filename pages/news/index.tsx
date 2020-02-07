import _, { StringNullableChain } from 'lodash';
import React from 'react';
import btoa from 'btoa';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { Segment, Icon } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import { useWebtask, RSS_TASK } from 'hooks/webtask';

export const NEWS_LOCALES = {
    [locale.EN]: 'en',
    [locale.ES]: 'es',
    [locale.DE]: 'de'
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
  const router = useRouter();
  const input = useInput();
  const news = ctx.news || [];
  const slug = _.get(ctx, 'slug', input || '');
  const titlePrefix = _.get(ctx, 't.news', 'News');
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
                items={news}
                header={(n) => _.get(n, 'title')}
                meta={(n) => _.get(n, 'rss:pubdate.#')}
                image={(n) => {
                    const link = _.get(n, 'link');
                    return `/api/meta/img/${btoa(link)}`;
                }}
                alt={(n) => _.get(n, 'title')}
                extra={(n) => {
                    const link = _.get(n, 'link');
                    return (<Grid.Extra>
                        <a href={link} target="_blank"><Icon color='teal' circular name="external alternate"/></a>
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
  const lang = NEWS_LOCALES[indexProps.locale] || NEWS_LOCALES[locale.EN];
  const newsTask = useWebtask(ctx)({
    taskName: RSS_TASK, 
    body: {
        rss: `https://news.google.com/rss?hl=${lang}${input ? `&q=${input}` : ''}`
    },
    cache: true
  });
  return {
      name: 'News',
      ...indexProps,
      slug: slug,
      news: (await newsTask || {}).rss || {}
  };
};

export default News;
