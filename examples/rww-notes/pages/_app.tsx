import '../styles/globals.css';
import { Provider } from 'react-redux';
import type { AppProps } from 'next/app';
import { store } from '../app/store';
import {
  ReactReduxFirebaseProvider,
  createFirestoreInstance,
} from 'read-write-web3';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/auth';

const app = firebase.initializeApp({
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_projectId,
});

const config = { userProfile: 'users', useFirestoreForProfile: true };

if (process.env.NODE_ENV !== 'production') {
  firebase.firestore().useEmulator('localhost', 8080);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider
        firebase={app}
        config={config}
        dispatch={store.dispatch}
        createFirestoreInstance={createFirestoreInstance}
      >
        <Component {...pageProps} />
      </ReactReduxFirebaseProvider>
    </Provider>
  );
}

export default MyApp;
