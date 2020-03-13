import Web from 'pages/web';

export const config = { amp: 'hybrid' };

const type = 'image';
const Images = (ctx:any) => Web(ctx);
Images.type = type;
Images.getInitialProps = async (ctx:any) => {
    return Web.getInitialProps({type, ...ctx});  
};

export default Images;
