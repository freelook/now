import _ from 'lodash';
import React from 'react';
import { useAmp } from 'next/amp';
import Locale from 'components/locale';
import Share from 'components/share';
import Comments from 'components/comments';
import { IndexContext } from 'functions';

interface FooterProps {
    ctx: IndexContext;
    media?: string;
    url?: string; 
}

const Footer = (props:FooterProps) => {
    const isAmp = useAmp();
    return (
        <footer>
            {!isAmp ?<Share {...props} /> : null}
            {!isAmp ? <Comments {...props} /> : null}
            <Locale ctx={props.ctx} />
        </footer>
    );
};

export default Footer;