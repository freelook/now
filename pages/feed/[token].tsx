import _ from 'lodash';
import React, {useEffect} from 'react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { Segment, Icon } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import * as route from 'hooks/route';
import { useWebtask, RSS_TASK } from 'hooks/webtask';

interface FeedContext extends IndexContext {
    link: string;
    feed: IFeedItem[];
}

export interface IFeedItem {
    title: string;
    description: string; // html
    link: string;
    'rss:pubdate': {'#': string};
}

const Feed = (ctx:FeedContext) => {
  const router = useRouter();
  const feed = _.get(ctx, 'feed', []);
  const titlePrefix = _.get(ctx, 't.Feed', 'Feed');
  const title = _.get(feed, '[0].meta.title');
  const image = _.get(feed, '[0].meta.image.url');
  const headTitle = title ? titlePrefix.concat(`: ${title}`): titlePrefix;
  const description = _.get(feed, '[0].meta.description', '');
  const url = _.get(feed, 'url', ctx.link || '');

  useEffect(() => {
    if(!title) {
        route.open(url);
        if(route.prev().length) {
            router.back();
        } else {
            router.replace(PATH.HOME);
        }
    }
  }, []);

  return title ? (
    <Layout head={{title: headTitle, description, image}}>
        <Nav {...{ctx}} />

        <Segment>
            <Grid<IFeedItem> className='feed'
                items={feed}
                header={(f) => _.get(f, 'title')}
                meta={(f) => _.get(f, 'rss:pubdate.#')}
                image={(f) => {
                    const link = _.get(f, 'link');
                    return `/api/meta/img/${route.encode(link)}`;
                }}
                alt={(f) => _.get(f, 'title')}
                link={(f)=> {
                    const link = _.get(f, 'link');
                    return {href: `${PATH.META}/[token]`, as: `${PATH.META}/${route.encode(link)}`};
                }}
                extra={(f) => {
                    const link = _.get(f, 'link');
                    return (<Grid.Extra>
                        <Nav.External link={link}><Icon color='teal' circular name="external alternate"/></Nav.External>
                    </Grid.Extra>);
                }}/>
        </Segment>

        <Footer {...{ctx}} media={image} />
    </Layout>
  ) : null;
};

Feed.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const token = _.get(query, 'token', '');
  const rss = route.decode(token);
  const indexProps = await useIndexProps(ctx);
  const feedTask = useWebtask(ctx)({
        taskName: RSS_TASK,
        body: { rss },
        cache: true
  });
  return {
      name: 'Feed',
      ...indexProps,
      link: rss,
      feed: (await feedTask || {}).rss || []
  };
};

export default Feed;
