import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { Segment, Icon, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';
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
            {news.length ? <List divided relaxed>
                {_.map(news, (n:INewsItem, i) => {
                    const title = _.get(n, 'title');
                    const link = _.get(n, 'link');
                    return title && link ? (
                         <List.Item key={`news-${i}`}>
                            <List.Content>{title}</List.Content>
                            <List.Content floated='right'>
                                <a href={link} target="_blank"><Icon color='teal' circular name="external alternate"/></a>
                            </List.Content>
                        </List.Item>
                    ) : null;
                })}
            </List> : null}
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
