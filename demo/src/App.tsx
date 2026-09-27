import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import Page from '@demo/components/Page';
import '@demo/styles/common.scss';
import '@extensions/styles/globals.css';
import { Toaster } from '@demo/components/app-ui';
import { history } from './utils/history';
import Home from '@demo/pages/Home';

const Editor = React.lazy(() => import('@demo/pages/Editor'));

function App() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <Page>
        <Suspense
          fallback={
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                width='200px'
                src='/loading'
                alt=''
              />
              <p
                style={{
                  fontSize: 24,
                  color: 'rgba(0, 0, 0, 0.65)',
                }}
              >
                Please wait a moment.
              </p>
            </div>
          }
        >
          <Router history={history}>
            <Switch>
              <Route
                path='/'
                exact
                component={Home}
              />
              <Route
                path='/editor'
                component={Editor}
              />
            </Switch>
          </Router>
        </Suspense>
      </Page>
    </>
  );
}

export default App;
