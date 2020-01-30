import _ from 'lodash';
import React from 'react';
import Link, {LinkProps} from 'next/link';
import { Grid as SemanticGrid, Card, Image, Icon } from 'semantic-ui-react';
import { useRandomColor } from 'hooks/render';

const GRID_CLASS_NAME = `fli-items`;
const GRID_ITEM_CLASS_NAME = `fli-item`;
const GRID_ITEM_IMAGE = '/static/no_image.png';
const GRID_ITEM_WIDTH = 300;

type ElementType = string|JSX.Element;

interface GridProps<T> {
   className?: string; 
   items: T[];
   image?: (item:T) => string;
   alt?: (item:T) => string;
   header?: (item:T) => ElementType;
   link?: (item:T) => LinkProps;
   meta?: (item:T) => ElementType;
   description?: (item:T) => ElementType;
   extra?: (item:T) => ElementType;
}

const Linkify = (props: {link?: LinkProps; children: any}) => {
    const {link} = props;
    return link ? <Link href={link.href} as={link.as}><a>{props.children}</a></Link>: props.children;
}

const Grid = <T extends {}>(props:GridProps<T>) => { 
    const className = _.get(props, 'className', '').concat(' ').concat(GRID_CLASS_NAME).trim();
    return (
        <SemanticGrid centered className={className}>
            {_.map(props.items, (it:T, i:number) => {
                const image = props.image && props.image(it) || GRID_ITEM_IMAGE;
                const alt = props.alt && props.alt(it);
                const header = props.header && props.header(it);
                const link = props.link && props.link(it);
                const meta = props.meta && props.meta(it);
                const description = props.description && props.description(it);
                const extra = props.extra && props.extra(it);
                return (<SemanticGrid.Column key={`${GRID_ITEM_CLASS_NAME}-${i}`}>
                    <Card color={useRandomColor(i)}>
                        <Card.Content>
                            {header && <Card.Header><Linkify link={link}>{header}</Linkify></Card.Header>}
                            {meta && <Card.Meta>{meta}</Card.Meta>}
                            <Linkify link={link}>
                                <Image alt={alt} src={image} wrapped onError={(e:React.SyntheticEvent|any) => {
                                    e.persist();
                                    e.target.src = GRID_ITEM_IMAGE;
                                }}/>
                            </Linkify>
                            {description && <Card.Description>{description}</Card.Description>}
                            {extra && <Card.Content extra>{extra}</Card.Content>}
                        </Card.Content>
                    </Card>
                </SemanticGrid.Column>);
            })}
            <style jsx global>{`
                .fli-items {
                   margin: auto !important;
                   overflow-wrap: break-word;
                   display: block !important;
                   column-count: 1;
                   column-gap: 0;
                }
                .fli-items .column {
                   width: 100% !important;
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
    );
};

Grid.Extra = (props: {children: JSX.Element|JSX.Element[]}) => {
    return (
        <div style={{marginTop: '5px', textAlign: 'right'}}>
            {props.children}
        </div>
    );
};

export default Grid;