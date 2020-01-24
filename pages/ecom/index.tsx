import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Segment } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';

export const ECOM_LOCALES = [locale.EN, locale.ES];
export const ECOM_PARENT_NODES = {
    US: ["2617941011", "2619525011", "15684181", "3760901", "3760911", "283155", "165796011", "1055398", "3375251", "172282"]
};

interface EcommerceContext extends IndexContext {
    node?: string;
    nodes: {BrowseNodesResult: {BrowseNodes: INode[]}};
}

interface INode {
    DisplayName: string;
    Id: string;
    IsRoot: boolean;
    Children?: INode|INode[];
    Ancestor?: INode|INode[];
}

const Ecommerce = (ctx:EcommerceContext) => {
  const router = useRouter();
  const input = useInput();
  const nodes = _.get(ctx.nodes, 'BrowseNodesResult.BrowseNodes', []);
  const renderNodes = (nodes: INode[] = [], space:string = '') => _.map(nodes, (n: INode) => {
    if(n && n.Id) {
        const slug = _.chain(n).get('DisplayName', '').trim().replace(/&|\?/mig, '').replace(/( )+/mig, '-').value();
        const node = !!slug ? slug.concat('-').concat(n.Id): n.Id;
        return (<div key={`node-${n.Id}`}>
                {n.Ancestor && renderNodes(_.isArray(n.Ancestor) ? n.Ancestor: [n.Ancestor], '*')}
                {space} <Link href={route.buildUrl(router, {query: { node }})}>
                            <a>{n.DisplayName}</a>
                        </Link>
                {n.Children && renderNodes(_.isArray(n.Children) ? n.Children: [n.Children], space + '-')}
        </div>);
    }
  });

  return (
    <Layout head={{title: _.get(ctx, 't.ecommerce', 'E-commerce'), description: '', url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} />
        </Segment>

        <Segment>
            {input}
        </Segment>

        <Segment>
            {ctx.node && <Link href={route.buildUrl(router, {query: {node: ''}})}><a>{'^'}</a></Link>}
            {renderNodes(nodes)}
        </Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const node = _.last(_.get(query, 'node', '').split('-'));
  return {
      name: 'Ecommerce',
      ... await useIndexProps(ctx),
      node: node,
      nodes: (await useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getBrowseNodes',
        body: {
            BrowseNodeIds: node ? [node] : ECOM_PARENT_NODES.US,
            Resources: ["BrowseNodes.Ancestor", "BrowseNodes.Children"]
        },
        cache: '86400' // one day
      }) || {})
  };
};

export default Ecommerce;
