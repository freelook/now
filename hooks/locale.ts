import _ from 'lodash';
import {useEffect, useState} from 'react';
import { useRouter } from 'next/router';

const defaultLocale = 'en';

const getLocale = (ctx:any) => _.get(ctx, 'query.locale', defaultLocale);

export const useLocale =(ctx:any) => {
  const router = useRouter();
  const ctxLocale = getLocale(ctx);
  const [locale, setLocale] = useState(ctxLocale);

  useEffect(() => {
    const routeLocale = getLocale(router);
    setLocale(routeLocale);
  }, [locale]);

  return locale;
};