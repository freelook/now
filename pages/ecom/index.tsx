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
import { useWebtask, AMZN_TASK } from 'hooks/webtask';
import { buildUrl } from 'hooks/route';
import * as render from 'hooks/render';

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
  const renderNodes = (nodes: INode[] = [], space:string = '') => _.map(nodes, (n: INode) => n && (
    <div key={`node-${n.Id}`}>
        {n.Ancestor && renderNodes(_.isArray(n.Ancestor) ? n.Ancestor: [n.Ancestor], '*')}
        {space} <Link href={buildUrl(PATH.ECOM, {query: {
                      node: n.Id,
                      slug: n.DisplayName.replace(/&|\?/mig, '').replace(/( )+/mig, '-')} })}>
                    <a>{n.DisplayName}</a>
                </Link>
        {n.Children && renderNodes(_.isArray(n.Children) ? n.Children: [n.Children], space + '-')}
    </div>
  ));

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
            {ctx.node && <Link href={buildUrl(PATH.ECOM, {query: {node: '', slug: ''}})}><a>{'^'}</a></Link>}
            {renderNodes(nodes)}
        </Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  const qs = render.qs(ctx);
  const node = _.get(qs, 'node', '');
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
