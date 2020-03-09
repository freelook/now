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

export const load = (id:string, src:string, params?:{[key:string]:string}) => {
    const tag = 'script';
    const firstScript = document.getElementsByTagName(tag)[0];
    if (!document.getElementById(id) && firstScript) {
        const js = document.createElement(tag) as HTMLScriptElement;
        const parent = firstScript.parentNode;
        js.id = id;
        js.src = src;
        if(params) {
            _.map(params, (v, k)=> {
                js.setAttribute(k, v);
            });
        }
        if(parent) {
            parent.insertBefore(js, firstScript);
        }
    }
};

export const encode = (v:string) => {
    return encodeURIComponent(v);
};

export const decode = (v:string) => {
    return decodeURIComponent(v);
};
