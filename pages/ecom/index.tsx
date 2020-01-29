import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter, NextRouter } from 'next/router';
import { Segment, Icon } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';

export const ECOM_LOCALES = [locale.EN, locale.ES];
export const ECOM_CACHE = '86400'; // one day
export const ECOM_PARENT_NODES = {
    US: ["2617941011", "2619525011", "15684181", "3760901", "3760911", "283155", "165796011", "1055398", "3375251", "172282"]
};

interface EcommerceContext extends IndexContext {
    node?: string;
    slug?: string;
    nodes: {BrowseNodesResult: {BrowseNodes: INode[]}};
    items: {SearchResult: {Items: IItem[]}}
}

export interface IItem {
    ASIN: string;
    DetailPageURL: string;
    Offers: {Listings: [{Price: {DisplayAmount: string}}]};
    Images: {Primary: {Large: {URL: string}}};
    ItemInfo: {
        Title: {DisplayValue: string; Label: string;};
        Features: {DisplayValues: string[]; Label: string;};
        TradeInInfo: {Price: {DisplayAmount: string};};
    };
}

interface INode {
    DisplayName: string;
    Id: string;
    IsRoot: boolean;
    Children?: INode|INode[];
    Ancestor?: INode|INode[];
}

const renderHomeNode = (router: NextRouter) => (<Link href={route.buildUrl(router, {query: {node: ''}, pathname: PATH.ECOM})}><a><Icon name="eye slash"/></a></Link>);
const renderFullNodes = (router: NextRouter) => (nodes: INode[] = [], space:string = ' | ') => _.map(nodes, (n: INode) => {
    if(n && n.Id) {
        const slug = route.slug(n, 'DisplayName');
        const node = !!slug ? slug.concat('-').concat(n.Id): n.Id;
        return (<span key={`node-${n.Id}`}>
                {n.Ancestor && renderFullNodes(router)(_.isArray(n.Ancestor) ? n.Ancestor: [n.Ancestor], '*')}
                {space} <Link href={route.buildUrl(router, {query: { node }, pathname: PATH.ECOM})}>
                            <a>{n.DisplayName}</a>
                        </Link>
                {n.Children && renderFullNodes(router)(_.isArray(n.Children) ? n.Children: [n.Children], ' - ')}
        </span>);
    }
});
export const renderNodes = (router: NextRouter) => (nodes: INode[] = []) => {
    return (<>
        {renderHomeNode(router)}
        {renderFullNodes(router)(nodes)}
    </>);
};

const Ecommerce = (ctx:EcommerceContext) => {
  const router = useRouter();
  const input = useInput();
  const nodes = _.get(ctx.nodes, 'BrowseNodesResult.BrowseNodes', []);
  const items = _.get(ctx.items, 'SearchResult.Items', []);
  const slug = _.get(ctx, 'slug', '');
  const titlePrefix = _.get(ctx, 't.ecommerce', 'E-commerce');
  const title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  const description = slug;

  return (
    <Layout head={{title: title, description: description, url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} />
        </Segment>

        <Segment>
            {renderNodes(router)(nodes)}
        </Segment>

        <Segment>
            <Grid<IItem> 
                  items={items} 
                  header={(it) => _.get(it, 'ItemInfo.Title.DisplayValue')}
                  image={(it) => _.get(it, 'Images.Primary.Large.URL')}
                  meta={(it) => _.get(it, 'Offers.Listings[0].Price.DisplayAmount')}
                  alt={(it) => _.get(it, 'ItemInfo.Title.DisplayValue')}
                  link={(it)=> {
                      const asin = _.get(it, 'ASIN', '');
                      const slug = route.slug(it, 'ItemInfo.Title.DisplayValue');
                      return `${PATH.ECOM}/it/${asin}/${slug}`;
                  }}
                  extra={(it) => {
                      const dp = _.get(it, 'DetailPageURL', '');
                      return (<div style={{marginTop: '5px', textAlign: 'right'}}>
                        <a href={dp} target="_blank"><Icon color='teal' circular name="external alternate"/></a>
                      </div>);
                  }} />
        </Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input', 'deals');
  const slugArr = _.get(query, 'node', '').split('-');
  const node = _.last(slugArr) || null;
  const slug = slugArr.slice(0, -1).join(' ');
  const indexProps = await useIndexProps(ctx);
  const nodesTaks = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getBrowseNodes',
        body: {
            BrowseNodeIds: node ? [node] : ECOM_PARENT_NODES.US,
            Resources: ["BrowseNodes.Ancestor", "BrowseNodes.Children"]
        },
        cache: ECOM_CACHE
  });
  const itemsTask = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/searchItems',
        body: {
            BrowseNodeId: node,
            Keywords: input,
            Resources:["Images.Primary.Large", "ItemInfo.Title", "Offers.Listings.Price"]
        },
        cache: ECOM_CACHE
  });
  return {
      name: 'Ecommerce',
      ...indexProps,
      node: node,
      slug: slug,
      nodes: await nodesTaks || {},
      items: await itemsTask || {}
  };
};

export default Ecommerce;
