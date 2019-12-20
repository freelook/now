import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import Link from 'next/link';
import Layout from '../components/layout';
import Head from '../components/head';
import Nav from '../components/nav';

const Home = () => {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    async function getDate() {
      const res = await fetch('/api/date');
      const newDate = await res.json();
      setDate(newDate.date as string);
    }
    getDate();
  }, []);

  return (
    <Layout>
      <Head title="Home" description="" url="" ogImage="" />
      <Nav />

      <div className="hero">
        <h1 className="title">Welcome to freelook.now!</h1>
        <p className="description">
          <Button>Just do it</Button>
        </p>

        <p className="row date">
          The date is:&nbsp; {date
            ? <span><b>{date}</b></span>
            : <span className="loading"></span>}
        </p>

        <div className='row'>
          <Link href='https://github.com/freelook/now'>
            <a className='card'>
              <h3>Getting Started &rarr;</h3>
              <p>Learn more about freelook.now project</p>
            </a>
          </Link>
        </div>
      </div>

    </Layout>
  );
}

export default Home;
