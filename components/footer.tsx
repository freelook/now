import _ from 'lodash';
import React from 'react';
import Locale from 'components/locale';
import Share from 'components/share';
import Comments from 'components/comments';
import { IndexContext } from 'pages';

interface FooterProps {
    ctx: IndexContext;
    media?: string;
    url?: string; 
}

const Footer = (props:FooterProps) => {
    return (
        <footer>
            <Share {...props} />
            <Comments {...props} />
            <Locale ctx={props.ctx} />
        </footer>
    );
};

export default Footer;