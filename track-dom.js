const provider = new firebase.auth.GoogleAuthProvider();
const router = new Navigo('/');

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let userData = user.providerData[0]
        //console.log(userData)
        document.querySelector('.your-tracks').innerText = 'Your Tracks';
        document.querySelector('.sign-button').innerHTML = 'Sign out';
        document.querySelector('.sign-button').onclick = () => {
            firebase.auth().signOut()
        }
        document.querySelector('.your-tracks-wrapper').onclick = () => {
            location.href = `/users.html?id=${user.uid}`
        }
        document.querySelector('.upload-button').onclick = () => {
            location.href = '/upload.html'
        }

        streamTrackFromURL(assignInitalListeners);
    } else {
        console.warn('user is signed out')

        document.querySelector('.sign-button').innerHTML = 'Sign in';
        document.querySelector('.sign-button').onclick = () => {
            firebase.auth().signInWithRedirect(provider)
        }
        document.querySelector('.your-tracks-wrapper').onclick = () => {
            location.href = `/users.html`
        }
        document.querySelector('.upload-button').onclick = () => {
            location.href = '/upload.html'
        }

        Page.init()
    }
});    


function setInfoHeight () {
    let wrapper = document.querySelector('.moreinfo')
    wrapper.style.height = (wrapper.scrollHeight + 200) + 'px'
}
setInfoHeight()




function setColorTheme () {
    const darkThemeStyles = `
        :root {
            --footer-bg: rgb(30, 39, 38);
        }
        .track-view .rectangle-top-left {
            background-color: rgb(41 51 50);
        }
        .track-view .rectangle-top-lef.waiting {
            background-color: rgba(149, 181, 178, 0);
        }
        .track-view .track-artist-details, .track-view .track-lyrics {
            color: rgb(177 197 197);
        }
        .satoshi-regular-normal-te-papa-green-16px {
            color: #bccece;
        }
        .track-view .rectangle-1-zo3Vw2 {
            background-color: #101918;
        }
        .track-view .track-title {
            color: #98b4be;
        }
        .track-view .track-artist {
            color: #89a6b1;
        }
        .track-view .x252-zo3Vw2 {
            color: #7a908d;
        }

        path#first {
            fill: #344c55;
        }
        path#second {
            fill: #2a4048;
        }
        path#third {
            fill: #21353c;
        }
        path#fourth {
            fill: #1b2d34;
        }

        .playButton::after, 
        .playButton
        {
          background: #17252b;
        }
        #bottom-right.playButton.animate-reverse:focus + div.outer-ring,
        #main-massive.playButton.animate-reverse:focus + div.outer-ring
        {
          border: #17252a 2px solid;
        }
    `
    let theme = document.body.dataset.theme;
    if (theme == 'dark') {
        let styleEl = document.createElement('style');
        styleEl.innerHTML = darkThemeStyles;
        document.body.appendChild(styleEl)
    }
}

setColorTheme();