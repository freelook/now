import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { Segment, Icon, StrictFormGroupProps } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import * as render from 'hooks/render';
import { useWebtask, WEB_TASK} from 'hooks/webtask';
import Images from './images';

export const WEB_LOCALES = {
    [locale.EN]: 'en',
    [locale.ES]: 'es',
    [locale.DE]: 'de'
} as {[key:string]:string};

interface WebContext extends IndexContext {
    type: string|undefined;
    results: IWebItem[];
}

export interface IWebItem {
    titleNoFormatting: string;
    contentNoFormatting: string;
    originalContextUrl?: string;
    url: string;
    richSnippet: {
      cseImage: { src: string }
    }
}

const Web = (ctx:WebContext) => {
  const input = useInput();
  const slug = _.get(ctx, 'slug', input || '');
  const titlePrefix = _.get(ctx, 't.Web', 'Web');
  const description = slug;
  let title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  if(ctx.type) {
      title = title.concat(` | ${ctx.type}`);
  }

  return (
    <Layout head={{title: title, description: description, image: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} />
        </Segment>

        <Segment>
            <Grid<IWebItem> className='news'
                items={ctx.results}
                header={(w) => _.get(w, 'titleNoFormatting')}
                image={(w) => ctx.type === Images.type ? _.get(w, 'url') : _.get(w, 'richSnippet.cseImage.src')}
                alt={(w) => _.get(w, 'titleNoFormatting')}
                description={(w) => _.get(w, 'contentNoFormatting')}
                link={(w)=> {
                    const url =  _.get(w, 'url');
                    const link = render.decode(ctx.type === Images.type ? _.get(w, 'originalContextUrl', url) : url);
                    return {href: `${PATH.META}/[token]`, as: `${PATH.META}/${route.encode(link)}`};
                }}
                imageLink={(w)=> {
                    const link = render.decode(_.get(w, 'url', ''));
                    return ctx.type === Images.type ? {href: link, target: '_blank'} : {href: `${PATH.META}/[token]`, as: `${PATH.META}/${route.encode(link)}`};
                }}
                extra={(w) => {
                    const link = render.decode(_.get(w, 'url', ''));
                    return (<Grid.Extra>
                        <Nav.External link={link}><Icon color='teal' circular name="external alternate"/></Nav.External>
                    </Grid.Extra>);
                }}/>
        </Segment>  

        <Footer {...{ctx}} />
    </Layout>
  );
};

Web.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input', '');
  const type = (ctx as WebContext).type;
  const slug = _.get(query, 'seo', input);
  const indexProps = await useIndexProps(ctx);
  const webTask = input ? useWebtask(ctx)({
    taskName: WEB_TASK,
    taskPath: 'web',
    body: {
        q: render.encode(input),
        type: type
    },
    cache: true
  }) : null;
  return {
      name: 'Web',
      ...indexProps,
      slug: slug,
      type: type,
      results: input ? (await webTask || {}).results : null
  };
};

export default Web;
