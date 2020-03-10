import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter, NextRouter } from 'next/router';
import { Segment, Icon, Pagination } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import * as suggest from 'hooks/suggest';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';

export const ECOM_LOCALES = {
    [locale.EN]: 'en_US',
    [locale.ES]: 'es_US',
    [locale.DE]: 'de_DE'
} as {[key:string]:string};
export const ECOM_CACHE = '86400'; // one day
export const ECOM_TOTAL_ITEMS = 10;
export const ECOM_FIRST_PAGE = 1;
export const ECOM_PARENT_NODES = {
    US: ["2617941011", "2619525011", "15684181", "3760901", "3760911", "283155", "165796011", "1055398", "3375251", "172282"]
};

interface EcommerceContext extends IndexContext {
    node?: string;
    slug?: string;
    page: number;
    nodes: {BrowseNodesResult: {BrowseNodes: INode[]}};
    items: {SearchResult: {Items: IItem[]; TotalResultCount: number;}};
    suggestion: string[];
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

const renderHomeNode = (router: NextRouter) => (<Link href={route.buildUrl(router, {query: {node: ''}, pathname: PATH.ECOM})} prefetch={false}><a><Icon name="eye slash"/></a></Link>);
const renderFullNodes = (router: NextRouter) => (nodes: INode[] = [], space:string = ' | ') => _.map(nodes, (n: INode) => {
    if(n && n.Id) {
        const slug = route.slug(n, 'DisplayName');
        const node = !!slug ? slug.concat('-').concat(n.Id): n.Id;
        return (<span key={`node-${n.Id}`}>
                {n.Ancestor && renderFullNodes(router)(_.isArray(n.Ancestor) ? n.Ancestor: [n.Ancestor], ' * ')}
                {space} <Link href={route.buildUrl(router, {query: { node }, pathname: PATH.ECOM})} prefetch={false}>
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
export const renderItems = (items:IItem[]) => {
    return !_.isEmpty(items) ? (
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
                      if(slug) {
                        return {href: `${PATH.ECOM}/it/[asin]/[seo]`, as: `${PATH.ECOM}/it/${asin}/${slug}`};
                      }
                      return {href: `${PATH.ECOM}/it/[asin]`, as: `${PATH.ECOM}/it/${asin}`};
                  }}
                  extra={(it) => {
                      const dp = _.get(it, 'DetailPageURL', '');
                      return (<Grid.Extra>
                        <Nav.External link={dp}><Icon color='teal' circular name="external alternate"/></Nav.External>
                      </Grid.Extra>);
                  }} />
        </Segment>
    ) : <></>;
}

const Ecommerce = (ctx:EcommerceContext) => {
  const router = useRouter();
  const input = useInput();
  const nodes = _.get(ctx.nodes, 'BrowseNodesResult.BrowseNodes', []);
  const items = _.get(ctx.items, 'SearchResult.Items', []);
  const total = _.get(ctx.items, 'SearchResult.TotalResultCount', 0);
  const slug = _.get(ctx, 'slug' , '');
  const titlePrefix = _.get(ctx, 't.Ecom', 'Ecom');
  let title = slug ? titlePrefix.concat(`: ${slug}`): titlePrefix;
  title = input ? title.concat(`: ${input}`) : title;
  let description = input || '';
  description = slug ? description.concat(` ${slug}`) : description;

  return (
    <Layout head={{title: title, description: description, image: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} query={{p:null}}/>
        </Segment>

        <Segment>
            {renderNodes(router)(nodes)}
        </Segment>

       {renderItems(items)}

        <div style={{textAlign: 'center', margin: '15px 0'}}>
            {items.length && total && items.length < total ? <Pagination
                boundaryRange={0}
                siblingRange={2}
                ellipsisItem={null}
                firstItem={null}
                lastItem={null}
                totalPages={Math.min(ECOM_TOTAL_ITEMS, _.toInteger(Math.ceil(total / ECOM_TOTAL_ITEMS)))} 
                defaultActivePage={ctx.page}
                pageItem={(PaginationItem, props) => {
                    const p = _.toString(props.value);
                    const href = route.buildUrl(router, {query: { p }, pathname: PATH.ECOM});
                    props.onClick = _.noop;
                    return <Link key={p} passHref={true} href={href} prefetch={false}><PaginationItem {...props} /></Link>;
                }} /> : null}
        </div>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input', 'deals');
  const page = Math.min(Math.max(_.chain(query).get('p').toInteger().value(), ECOM_FIRST_PAGE), ECOM_TOTAL_ITEMS);
  const slugArr = _.get(query, 'node', '').split('-');
  const node = _.last(slugArr) || null;
  const slug = slugArr.slice(0, -1).join(' ').trim() || _.get(query, 'seo', '');
  const indexProps = await useIndexProps(ctx);
  const lang = ECOM_LOCALES[locale.getLng(indexProps.locale)] || ECOM_LOCALES[locale.EN];
  const nodesTaks = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getBrowseNodes',
        body: {
            LanguagesOfPreference: [lang],
            BrowseNodeIds: node ? [node] : ECOM_PARENT_NODES.US,
            Resources: ["BrowseNodes.Ancestor", "BrowseNodes.Children"]
        },
        cache: ECOM_CACHE
  });
  const itemsTask = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/searchItems',
        body: {
            LanguagesOfPreference: [lang],
            BrowseNodeId: node,
            Keywords: input,
            ItemPage: page,
            Resources:["Images.Primary.Large", "ItemInfo.Title", "Offers.Listings.Price"]
        },
        cache: ECOM_CACHE
  });
  const suggestion = suggest.useSuggestion(ctx)(input);
  return {
      name: 'Ecommerce',
      ...indexProps,
      node: node,
      slug: slug,
      page: page,
      nodes: await nodesTaks || {},
      items: await itemsTask || {},
      suggestion: await suggestion || []
  };
};

export default Ecommerce;
