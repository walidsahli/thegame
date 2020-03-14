
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const settings = {};
const config = {
    apiKey: "AIzaSyDGYysUQpHI7j8xJO4Oo5bKOgwJM56DmcA",
    authDomain: "game-dc9f2.firebaseapp.com",
    databaseURL: "https://game-dc9f2.firebaseio.com",
    projectId: "game-dc9f2",
    storageBucket: "game-dc9f2.appspot.com",
    messagingSenderId: "364104294077",
    appId: "1:364104294077:web:f7d86c280dac19b66761d4",
    measurementId: "G-4WBR048DFN"
};
firebase.initializeApp(config);
firebase.firestore().settings(settings);

export default firebase;
