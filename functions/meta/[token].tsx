import _ from 'lodash';
import React, {useEffect} from 'react';
import { NextPageContext } from 'next';
import Link from 'components/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { Segment, Icon, Table, Image, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'functions';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import {GRID_SCHEMA} from 'components/grid';
import Footer from 'components/footer';
import Input from 'components/input';
import * as route from 'hooks/route';
import * as suggest from 'hooks/suggest';
import * as render from 'hooks/render';
import { useWebtask, META_TASK } from 'hooks/webtask';

export const config = { amp: 'hybrid' };

interface MetaContext extends IndexContext {
    link: string;
    redirect: string;
    image?: string;
    meta: Object;
}

const Meta = (ctx:MetaContext) => {
  const isAmp = useAmp();
  const important = render.important(isAmp);
  const router = useRouter();
  const meta = _.get(ctx, 'meta', {});
  const redirect = _.get(ctx, 'redirect', '');
  const ctxImage = _.get(ctx, 'image');
  const titlePrefix = _.get(ctx, 't.Meta', 'Meta');
  const title = _.get(meta, 'og:title', _.get(meta, 'title', ''));
  const headTitle = title ? titlePrefix.concat(`: ${title}`): titlePrefix;
  const description = _.get(meta, 'og:description', _.get(meta, 'description', ''));
  const image = ctxImage || _.get(meta, 'og:image', _.get(meta, 'twitter:image', ''));
  const keywords = suggest.filter(_.get(meta, 'keywords', _.get(meta, 'news_keywords', '')).split(','));
  const url = _.get(meta, 'og:url', ctx.link || '');
  const rss = _.get(meta, 'rss');

  useEffect(() => {
    if(!!redirect) {
        const to = _.get(PATH, redirect);
        if(!to) {
            setTimeout(() => route.replace(ctx.link), 1234);
        } else {
           route.open(ctx.link);
           router.replace(to); 
        }
    } else if(!(title || description || image)) {
        route.open(url);
        if(route.prev().length) {
            router.back();
        } else {
            router.replace(PATH.HOME);
        }
    }
  }, []);

  return title || description || image ? (
    <Layout head={{title: headTitle, description, image}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} pathname={PATH.NEWS}/>
        </Segment>

        <Segment className="meta" itemScope itemType={GRID_SCHEMA}>
            <Table color={render.useRandomColor(title.length)}><Table.Body>
                <Table.Row>
                    <Table.Cell rowSpan={2} textAlign='center'>
                    {!isAmp ? <Image itemProp="image" wrapped src={image} alt={title} /> :                                 
                    <div className='amp-container'>
                        <amp-img itemProp="image" className='contain' alt={title} src={image} layout='fill' />
                    </div>}
                    </Table.Cell>
                    <Table.Cell><h3 {...{itemProp:'name'}}>{title}</h3></Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign='right' itemProp="offers">
                         {rss ? <Link href={`${PATH.FEED}/${route.encode(rss)}`} prefetch={false}><a><Icon circular name="feed"/></a></Link> : null}
                         <Nav.External link={url}><Icon color='teal' circular name="external alternate"/></Nav.External>
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell colSpan={2} itemProp="description">{description}</Table.Cell>
                </Table.Row>
                {
                    keywords.length > 0 ?
                    <Table.Row>
                        <Table.Cell colSpan={2}><List horizontal itemProp="keywords">{
                            _.map(keywords, (v, k) => <List.Item key={k}>
                                <Link href={route.buildUrl(router, {pathname: PATH.NEWS, query: {input:v} })} prefetch={false}><a>{v}</a></Link>
                            </List.Item>)
                        }</List></Table.Cell>
                    </Table.Row>
                    : null
                }
            </Table.Body></Table>
        </Segment>

        <Footer {...{ctx}} media={image} url={url} />

        <style jsx global>{`
            .meta img {
                max-width: 100% ${important};
            }
        `}</style>
    </Layout>
  ) : null;
};

Meta.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const token = _.get(query, 'token', '');
  const redirect = _.get(query, 'r', '');
  const img = _.get(query, 'img');
  const url = route.decode(token);
  const indexProps = await useIndexProps(ctx);
  const metaTask = useWebtask(ctx)({
        taskName: META_TASK,
        body: { url },
        cache: true
  });
  return {
      name: 'Meta',
      ...indexProps,
      link: url,
      redirect: redirect,
      image: img ? route.decode(img) : undefined,
      meta: await metaTask || {}
  };
};

export default Meta;
