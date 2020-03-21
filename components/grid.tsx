import _ from 'lodash';
import React from 'react';
import { useAmp } from 'next/amp';
import Link, {LinkProps} from 'next/link';
import { Grid as SemanticGrid, Card, Image, Icon } from 'semantic-ui-react';
import * as render from 'hooks/render';

export const GRID_CLASS_NAME = `fli-items`;
export const GRID_ITEM_CLASS_NAME = `fli-item`;
export const GRID_ITEM_IMAGE = '/static/no_image.png';
export const GRID_SCHEMA = 'http://schema.org/Article';
export const GRID_SCHEMA_OFFER = 'http://schema.org/Offer';
export const GRID_ITEM_WIDTH = 300;

type ElementType = string|JSX.Element;

interface LinkAttr extends LinkProps {
    target?: string;
}

interface GridProps<T> {
   className?: string; 
   items: T[];
   image?: (item:T) => string;
   imageAlternate?: (item:T) => string;
   alt?: (item:T) => string;
   header?: (item:T) => ElementType;
   link?: (item:T) => LinkAttr;
   imageLink?: (item:T) => LinkAttr;
   meta?: (item:T) => ElementType;
   description?: (item:T) => ElementType;
   extra?: (item:T) => ElementType;
   schema?: (item:T) => string;
}

const Linkify = (props: {link?: LinkAttr; children: any; target?:string}) => {
    const {link} = props;
    if(!link) {
        return props.children;
    }
    const target = _.get(link, 'target');
    const aProps:{[key:string]:string} = target ? {target} : {};
    aProps['itemProp'] = 'url';
    return <Link href={link.href} as={link.as} prefetch={false}><a {...aProps}>{props.children}</a></Link>;
}

const Grid = <T extends {}>(props:GridProps<T>) => {
    const isAmp = useAmp();
    const important = render.important(isAmp);
    const className = _.get(props, 'className', '').concat(' ').concat(GRID_CLASS_NAME).trim();
    return !_.isEmpty(props.items) ? (
        <SemanticGrid centered className={className}>
            {_.map(props.items, (it:T, i:number) => {
                const image = props.image && props.image(it) || GRID_ITEM_IMAGE;
                const imageAlternate = props.imageAlternate && props.imageAlternate(it);
                const alt = props.alt && props.alt(it);
                const header = props.header && props.header(it);
                const link = props.link && props.link(it);
                const imageLink = props.imageLink && props.imageLink(it) || link;
                const meta = props.meta && props.meta(it);
                const description = props.description && props.description(it);
                const extra = props.extra && props.extra(it);
                const schema = props.schema && props.schema(it) || GRID_SCHEMA;
                return (<SemanticGrid.Column key={`${GRID_ITEM_CLASS_NAME}-${i}`}>
                    <Card color={render.useRandomColor(i)}>
                        <Card.Content itemScope itemType={schema}>
                            {header && <Card.Header itemProp="name"><Linkify link={link}>{header}</Linkify></Card.Header>}
                            {meta && <Card.Meta itemProp="identifier">{meta}</Card.Meta>}
                            <Linkify link={imageLink}>
                                { !isAmp ?
                                <Image itemProp="image" alt={alt} src={image} wrapped onError={(e:React.SyntheticEvent|any) => {
                                    e.persist();
                                    if(imageAlternate && !_.endsWith(e.target.src, imageAlternate)) {
                                        e.target.src = imageAlternate;
                                    } else if(!_.endsWith(e.target.src, GRID_ITEM_IMAGE)) {
                                        e.target.src = GRID_ITEM_IMAGE;
                                    } else {
                                        return e && e.stopPropagation();
                                    }
                                }}/> : 
                                <div className='amp-container'>
                                    <amp-img itemProp="image" className='contain' alt={alt} src={image} layout='fill' />
                                </div>
                                }
                            </Linkify>
                            {description && <Card.Description itemProp="description">{description}</Card.Description>}
                            {extra && <Card.Content itemProp="offers" itemScope itemType={GRID_SCHEMA_OFFER} extra>{extra}</Card.Content>}
                        </Card.Content>
                    </Card>
                </SemanticGrid.Column>);
            })}
            <style jsx global>{`
                .fli-items {
                   margin: auto ${important};
                   overflow-wrap: break-word;
                   display: block ${important};
                   column-count: 1;
                   column-gap: 0;
                }
                .fli-items .ui.image {
                   width: 100%;
                   margin: 5px 0;
                   min-height: 150px;
                   background: #f7f7f7;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                }
                .fli-items .column {
                   width: 100% ${important};
                }
                @media only screen and (min-width: ${GRID_ITEM_WIDTH * 2}px) {
                .fli-items {
                    column-count: 2;
                }
                }
                @media only screen and (min-width: ${GRID_ITEM_WIDTH * 3}px) {
                .fli-items {
                    column-count: 3;
                }
                }
                @media only screen and (min-width: ${GRID_ITEM_WIDTH * 4}px) {
                .fli-items {
                    column-count: 4;
                }
                }
                @media only screen and (min-width: ${GRID_ITEM_WIDTH * 5}px) {
                .fli-items {
                    column-count: 5;
                }
                }
            `}</style>
        </SemanticGrid>
    ) : null;
};

Grid.Extra = (props: {children: JSX.Element|JSX.Element[]}) => {
    return (
        <div style={{marginTop: '5px', textAlign: 'right'}}>
            {props.children}
        </div>
    );
};

export default Grid;