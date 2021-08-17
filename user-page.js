const provider = new firebase.auth.GoogleAuthProvider();
const router = new Navigo('/');

firebase.initializeApp({
    apiKey: "AIzaSyAhWA9p5XPVlnTLKZPMt7D5lPqcgjPGLAY",
    authDomain: "plug-music-app-database.firebaseapp.com",
    databaseURL: "https://plug-music-app-database-default-rtdb.firebaseio.com",
    projectId: "plug-music-app-database",
    storageBucket: "plug-music-app-database.appspot.com",
    messagingSenderId: "1053988739108",
    appId: "1:1053988739108:web:218b4bd545c21269eea0b1"
});

router.on('/users.html', ({ params }) => {
    console.log(params)
})

router.on('/auth', ({ pathData }) => {
    console.log(pathData)
    firebase.auth().signInWithRedirect(provider)
})

function start (user) {
    console.log(user)
    var firstName =  user.displayName.split(' ').slice(0, -1).join(' ');
    var lastName =  user.displayName.split(' ').slice(-1).join(' ');
    document.querySelector('.greeting-text').textContent = 'Welcome, ' + firstName;

    pushUsersTracks(user.providerData[0].uid);
}

(() => {
    let searchParams = new URL(location.href).searchParams;
    let currentUser = firebase.auth().currentUser

    if (currentUser) {
        console.log('firebase user is logged in')
        return start(currentUser.providerData[0]);
    }
    
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            searchParams.delete('id')
            router.navigate('/auth');
            return console.warn('ID in params but not signed in')
        }

        if (searchParams.has('id')) {    
            if (user.uid != searchParams.get('id')) {
                searchParams.delete('id')
                router.navigate('/auth');
                return console.warn('ID in params does not match with signed in user ID')
            }
    
            start(user)
            return console.log('got id from params');
        } else {
            router.navigate('/users.html?id=' + user.uid);
            start(user)
            return console.warn('ID from firebase pushed to router URL')
        }
    })
})();

function pushUsersTracks (uid) {
    firebase.database().ref(`users/${uid}/tracks`).on('value', (snapshot) => {
        let tracks = snapshot.val()

        Object.keys(tracks).forEach(key => {
            let track = tracks[key];
            console.log(track)

            let card = document.createElement('div');
            card.className = 'latest-card';
            card.innerHTML = `
                <div class="track-card-title">${track.info.title}</div>
            `;

            card.addEventListener('click', () => {
                location.href = '/track.html?id=' + key;
            })

            document.querySelector('.latest-cards').appendChild(card);
        })
    })
}