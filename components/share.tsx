import _ from 'lodash';
import React from 'react';
import { Segment, Icon } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import { IndexContext } from 'pages';
import * as rs from 'react-share';
import { FLI_DOMAIN } from 'components/head';

const providers = {
  facebook: {component: rs.FacebookShareButton, icon: rs.FacebookIcon},
  twitter: {component: rs.TwitterShareButton, icon: rs.TwitterIcon},
  linkedin: {component: rs.LinkedinShareButton, icon: rs.LinkedinIcon},
  pinterest: {component: rs.PinterestShareButton, icon: rs.PinterestIcon, media: true},
  reddit: {component: rs.RedditShareButton, icon: rs.RedditIcon},
  telegram: {component: rs.TelegramShareButton, icon: rs.TelegramIcon},
  tumblr: {component: rs.TumblrShareButton, icon: rs.TumblrIcon},
  vk: {component: rs.VKShareButton, icon: rs.VKIcon},
  email: {component: rs.EmailShareButton, icon: rs.EmailIcon}
};

interface ShareProps {
    ctx: IndexContext;
    media?: string;
    url?: string;  
}

const Share = (props:ShareProps) => {
    const href = _.get(props, 'url', window.location.href);
    const media = _.get(props, 'media', `https://${FLI_DOMAIN}/static/no_image.png`);
    return (
        <Segment textAlign='center' style={{"overflowX": "auto", "whiteSpace": "nowrap"}}>
            <>
                <rs.FacebookShareCount url={href} />
                <Icon name='fork' />
            </>
            {_.map(providers, (v, k) => {
                return <v.component key={k} 
                    url={href} 
                    media={media} 
                    title={k} 
                    style={{margin: '0 1px'}}>
                    <v.icon size={30} round />
                </v.component>;
            })}
        </Segment>
    );
};

export default dynamic(() => Promise.resolve(Share), {ssr: false});
