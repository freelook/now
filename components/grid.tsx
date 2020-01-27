import _ from 'lodash';
import React from 'react';
import { Grid as SemanticGrid, Card, Image, Icon } from 'semantic-ui-react';
import { useRandomColor } from 'hooks/render';

const GRID_CLASS_NAME = `fli-items`;
const GRID_ITEM_CLASS_NAME = `fli-item`;
const GRID_ITEM_IMAGE = '/static/no_image.png';

type ElementType = string|JSX.Element;

interface GridProps<T> {
   className?: string; 
   items: T[];
   image?: (item:T) => string;
   header?: (item:T) => ElementType;
   meta?: (item:T) => ElementType;
   description?: (item:T) => ElementType;
   extra?: (item:T) => ElementType;
}

const Grid = <T extends {}>(props:GridProps<T>) => { 
    const className = _.get(props, 'className', '').concat(' ').concat(GRID_CLASS_NAME).trim();
    return (
        <SemanticGrid centered className={className}>
            {_.map(props.items, (it:T, i:number) => {
                const image = props.image && props.image(it) || GRID_ITEM_IMAGE;
                const header = props.header && props.header(it);
                const meta = props.meta && props.meta(it);
                const description = props.description && props.description(it);
                const extra = props.extra && props.extra(it);
                return (<SemanticGrid.Column mobile={8} tablet={5} computer={3} key={`${GRID_ITEM_CLASS_NAME}-${i}`}>   
                    <Card color={useRandomColor(i)}>
                        <Card.Content>
                            {header && <Card.Header>{header}</Card.Header>}
                            {meta && <Card.Meta>{meta}</Card.Meta>}
                            <Image src={image} wrapped />
                            {description && <Card.Description>{description}</Card.Description>}
                            {extra && <Card.Content extra>{extra}</Card.Content>}
                        </Card.Content>
                    </Card>
                </SemanticGrid.Column>);
            })}
        </SemanticGrid>
    );
};

export default Grid;