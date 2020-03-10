import _ from 'lodash';
import * as render from 'hooks/render';
import * as request from 'hooks/request';

export const SUGGEST_ENDPOINT = 'https://suggestqueries.google.com/complete/search?client=chrome&q=';
export const MAX_LTH = 11;

export const useSuggestion = (ctx:render.RenderContext) => async (input: string) => {
    let suggestion = [];
    try {
        if(_.isString(input)) {
            if(render.isSSR(ctx)) {
                suggestion = await request.get(`${SUGGEST_ENDPOINT}${input}`);
            } else {
                suggestion = await request.jsonp(`${SUGGEST_ENDPOINT}${input}`, {cache: true});
            }
        }
    } finally {
        return _.get(suggestion, '[1]', []);
    }
};

export const filter = (suggestion:string[] = [], max:number = MAX_LTH) => _
    .filter(suggestion, (s) => !/\/\//.test(s) && s.length < max)
    .map(_.trim);
