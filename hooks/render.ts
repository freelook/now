import { NextPageContext } from 'next';
import _ from 'lodash';
import { SemanticCOLORS } from 'semantic-ui-react';

export interface RenderContext extends NextPageContext {
    body?: any;
}

export const Colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey'];

export const isSSR = (ctx: RenderContext) => {
    return ctx && ctx.req;
};

export const qs = (ctx: RenderContext) => {
   return _.get(ctx, 'url.query', 
          _.get(ctx, 'query', {}
    ));
};

export const body = (ctx: RenderContext) => {
   return _.get(ctx, 'req.body', 
          _.get(ctx, 'body', {}
    ));
};

export const useRandomColor = (index?:number) => {
    let max = Colors.length - 1;
    let min = 0;
    if(!_.isUndefined(index) && _.isInteger(index)) {
        if(index <= max) {
            return Colors[index] as SemanticCOLORS;
        }
        let correctIndex = _.chain(_.toString(index)).last().toNumber().value() || 0;
        return Colors[correctIndex] as SemanticCOLORS;
    }
    return Colors[Math.floor(Math.random() * (max - min + 1) + min)] as SemanticCOLORS;
};