import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Segment, Icon, Table, Image, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import { useRandomColor } from 'hooks/render';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';
import { IItem, ECOM_CACHE, renderNodes } from 'pages/ecom';

interface EcommerceItemContext extends IndexContext {
    asin: string;
    slug?: string;
    item: {ItemsResult: {Items: [IItem]}};
}

const EcommerceItem = (ctx:EcommerceItemContext) => {
  const router = useRouter();
  const item = _.get(ctx.item, 'ItemsResult.Items[0]', {});
  const nodes = _.get(item, 'BrowseNodeInfo.BrowseNodes', []);
  const titlePrefix = _.get(ctx, 't.ecommerce', 'E-commerce');
  const itemTitle = _.get(item, 'ItemInfo.Title.DisplayValue', '');
  const itemPrice = _.get(item, 'Offers.Listings[0].Price.DisplayAmount', '');
  const itemFeatures = _.get(item, 'ItemInfo.Features.DisplayValues', []);
  const itemDp = _.get(item, 'DetailPageURL', '');
  const slug = _.get(ctx, 'slug', itemTitle);
  const title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  const description = slug;

  return (
    <Layout head={{title: title, description: description, url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            {renderNodes(router)(nodes)}
        </Segment>

        <Segment className="ecom-item">
            <Table color={useRandomColor(itemTitle.length)}><Table.Body>
                <Table.Row>
                    <Table.Cell rowSpan={2} textAlign='center'>
                    <Image wrapped src={_.get(item, 'Images.Primary.Large.URL')}/>
                    </Table.Cell>
                    <Table.Cell><h3>{itemTitle}</h3></Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign='right'>{itemPrice} <a href={itemDp} target="_blank"><Icon color='teal' circular name="external alternate"/></a></Table.Cell>
                </Table.Row>
                {itemFeatures.length > 0 ?
                <Table.Row>
                    <Table.Cell colSpan={2}><List bulleted>
                        {_.map(itemFeatures, (f: string, i) => (
                            <List.Item key={`feature-${i}`}>{f}</List.Item>
                        ))}
                    </List></Table.Cell>
                </Table.Row> : null} 
            </Table.Body></Table>
        </Segment>

        <Footer {...{ctx}} />

        <style jsx global>{`
            .ecom-item img {
                max-width: 100% !important;
            }
        `}</style>
    </Layout>
  );
};

EcommerceItem.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input', '*');
  const asin = _.get(query, 'asin', '');
  const slug = _.get(query, 'seo', '');
  const indexProps = await useIndexProps(ctx);
  const itemTask = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getItems',
        body: {
            ItemIds: [asin],
            Resources: [
                "Images.Primary.Large", "ItemInfo.Title", "Offers.Listings.Price",
                "BrowseNodeInfo.BrowseNodes", "ItemInfo.Features"
            ]
        },
        cache: ECOM_CACHE
  });
  return {
      name: 'EcommerceItem',
      ...indexProps,
      asin: asin,
      slug: slug,
      item: await itemTask || {}
  };
};

export default EcommerceItem;
