import _ from 'lodash';
import React from 'react';
import { Segment, Dropdown } from 'semantic-ui-react';
import Link from 'components/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { geo, lng, splitLocale } from 'hooks/locale';
import { buildUrl } from 'hooks/route';
import { IndexContext } from 'functions';

interface LocaleProps {
    ctx: IndexContext;
}

const Locale = (props:LocaleProps) => {
    const isAmp = useAmp();
    const router = useRouter();
    const [currentLng, currentGeo] = splitLocale(props.ctx.locale);

    const GeoContent = (props:{g:{code:string|undefined; text:string;}}) => {
        const {g} = props;
        return <Link href={buildUrl(router, {query: {locale: g.code ?`${currentLng}.${g.code}` : currentLng} })} prefetch={false}>
            <a>{g.text}</a>
        </Link>;
    };
    const LngContent = (props:{l:{code:string; text:string;}}) => {
        const {l} = props;
        return <Link href={buildUrl(router, {query: {locale: currentGeo ? `${l.code}.${currentGeo}` : l.code} })} prefetch={false}>
            <a>{l.text}</a>
        </Link>;
    };  

    return (
        <Segment textAlign='center'>
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <Dropdown selection compact value={currentLng} options={lng.map((l, i) => {
                return {key: i, value: l.code, text: l.text, content: (<LngContent l={l} />)};
            })} />
            <Dropdown placeholder={geo[0].text} search={!isAmp} selection value={currentGeo} options={geo.map((g, i) => {
                return {key: i, value: g.code, flag: g.code, text: g.text, content: (<GeoContent g={g} />)};
            })} />
        </div>
        </Segment>
    );
};

export default Locale;