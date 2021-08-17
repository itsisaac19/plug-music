class uploadFieldsObject {
    constructor () {
        this.trackTitle = document.querySelector('#trackTitle').value;
        this.trackArtist = document.querySelector('#trackArtist').value;
        this.trackDescription = document.querySelector('#trackDescription').value;
        this.trackLyrics = document.querySelector('#trackLyrics').value;
    }
    set () {
        this.trackTitle = document.querySelector('#trackTitle').value;
        this.trackArtist = document.querySelector('#trackArtist').value;
        this.trackDescription = document.querySelector('#trackDescription').value;
        this.trackLyrics = document.querySelector('#trackLyrics').value;
    }
    checkboxesAreChecked () {
        return document.querySelector('#ownership-check').checked && document.querySelector('#original-check').checked;
    }
    isPopulated () {
        this.set();
        if (this.trackTitle && this.trackArtist && this.checkboxesAreChecked()) {
            return true;
        }
        return false;
    }
}

const uploadFields = new uploadFieldsObject();

const FILESTACK_API_KEY = 'ALxoEda6VQ76Ilj7wYtGEz';
const file_io_API_KEY = '7O6BWVS.RJM0VBK-P4SMNQR-H823K5W-RWF4XWK'

firebase.initializeApp({
    apiKey: "AIzaSyAhWA9p5XPVlnTLKZPMt7D5lPqcgjPGLAY",
    authDomain: "plug-music-app-database.firebaseapp.com",
    databaseURL: "https://plug-music-app-database-default-rtdb.firebaseio.com",
    projectId: "plug-music-app-database",
    storageBucket: "plug-music-app-database.appspot.com",
    messagingSenderId: "1053988739108",
    appId: "1:1053988739108:web:218b4bd545c21269eea0b1"
});

const db = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();

const user = {};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let userData = user.providerData[0]
        console.log(userData)

        document.querySelector('.account-name').innerHTML = userData.email;
        document.querySelector('.google-account-wrapper').onclick = () => {
            firebase.auth().signOut();
        }
        
        getUserTrackCount().then(trackCount => {
            user.trackCount = trackCount;

            if (trackCount > 5) {
                console.warn('lul u have over 5 tracks')
            }

            console.log('User track count: ' + trackCount)

            Page.init();
        })
    } else {
        console.warn('user is signed out')

        document.querySelector('.account-name').innerHTML = 'Sign in with Google';
        document.querySelector('.google-account-wrapper').onclick = () => {
            firebase.auth().signInWithRedirect(provider)
        }
    }
});

const currentUser = () => {
    return firebase.auth().currentUser.providerData[0]
}

const isSignedIn = () => {
    return firebase.auth().currentUser ? true : false;
}

console.log("isSignedIn:", isSignedIn())




// FILEPOND ------------- 

const uploadElement = document.querySelector('#pond-upload');
FilePond.registerPlugin(FilePondPluginFileValidateType);

// Create a FilePond instance
const pond = FilePond.create(uploadElement, {
    acceptedFileTypes: ['audio/mpeg'],
    fileValidateTypeLabelExpectedTypes: 'Expects audio/mpeg',
    labelFileTypeNotAllowed: 'Only audio/mpeg files are accepted',
    fileValidateTypeDetectType: (source, type) =>
        new Promise((resolve, reject) => {
            // Do custom type detection here and return with promise
            resolve(type);
        }),
    instantUpload: false,
    server: {
        url: `https://plugmusic-api.herokuapp.com/`,
        revert: (res) => {
            let track = JSON.parse(res);
            let trackID = track.trackUID;

            const request = new XMLHttpRequest();

            request.onreadystatechange = function() {
                if (request.readyState === 4) {
                  console.log('Deleted file');
                }
            }

            request.open('DELETE', `https://plugmusic-api.herokuapp.com/delete${trackID}`);
            request.send();
        },
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            // Create FileReader instance
            let reader = new FileReader();

            // Read file as base64 string
            reader.readAsDataURL(file);

            let trackTitle = document.querySelector('#trackTitle').value;
            let trackArtist = document.querySelector('#trackArtist').value;
            let trackDescription = document.querySelector('#trackDescription').value.replace(/(?:\r\n|\r|\n)/g, '<br>');
            let trackLyrics = document.querySelector('#trackLyrics').value.replace(/(?:\r\n|\r|\n)/g, '<br>');

            let info = {
                title: trackTitle, 
                artist: trackArtist, 
                description: trackDescription, 
                lyrics: trackLyrics
            }

            let userId = currentUser().uid;
            
            const request = new XMLHttpRequest();

            request.open('POST', `https://plugmusic-api.herokuapp.com/upload`);
            request.setRequestHeader('Content-Type', 'application/json');

            reader.onload = (e) => {
                let encodedString = e.target.result;
                let data = JSON.stringify({
                    data: encodedString,
                    info: info,
                    uid: userId
                })

                request.send(data)
            }

            request.upload.onprogress = (e) => {
                progress(e.lengthComputable, e.loaded, e.total);
            };

            request.onload = function () {
                if (request.status >= 200 && request.status < 300) {
                    load(request.responseText);
                } else {
                    error('error occurred');
                }
            };

            request.onreadystatechange = function() {
                if (request.readyState === 4) {
                    console.log(request.response)
                }
            }
            
            
            
            // Should expose an abort method so the request can be cancelled
            return {
                abort: () => {
                    // This function is entered if the user has tapped the cancel button
                    request.abort();

                    // Let FilePond know the request has been cancelled
                    abort();
                },
            };
        }
    },
});

document.addEventListener('FilePond:addfile', () => {    
    if (isSignedIn() == false || uploadFields.isPopulated() == false) {
        pond.removeFiles();
        let errorMessage = isSignedIn() == false ? 'Please sign in' : 'Please fill in all required fields';
        alert(errorMessage)
        document.querySelector('.upload-action-button').onclick = () => {};
    } else {
        document.querySelector('.upload-action-button').onclick = uploadButtonHandler;
    }
});
document.addEventListener('FilePond:processfilestart', uploadButtonHandler);

function uploadButtonHandler (fromSameOrigin=true) {
    let uploadButton = document.querySelector('.upload-action-button');

    if (isSignedIn() == false || uploadFields.isPopulated() == false) {
        let errorMessage = isSignedIn() == false ? 'Please sign in' : 'Please fill in all required fields';
        alert(errorMessage)

        uploadButton.classList.remove('inprogress');
        uploadButton.classList.add('warn');
    } else {
        uploadButton.classList.add('inprogress');
        if (fromSameOrigin == false) return;
        document.querySelector('button.filepond--file-action-button.filepond--action-process-item').click();
    }
}

// FIREBASE REALTIME DATABASE

function saveTrackUrl (uploadResponseData, info) {
    console.log(uploadResponseData, info)

    let trackURL = uploadResponseData.url;
    let trackID = uploadResponseData.url.replace(/https:\/\/cdn\.filestackcontent\.com\//, '');;
    
    // Save track info to database
    db.ref(`/tracks/${trackID}`).set({
        id: trackID,
        url: trackURL,

        title: info.trackTitle,
        artist: info.trackArtist,
        description: info.trackDescription,
        lyrics: info.trackLyrics
    })

    // Save track id to database using the user's id
    db.ref(`/users/${currentUser().uid}/tracks/${trackID}`).set({
        id: trackID,
        title: info.trackTitle,
        artist: info.trackArtist,
    });
}


function getTrackURL (id) {
    db.ref(`/tracks/${id}`).get().then(snapshot => {
        let data = snapshot.val();
        console.log(data)
    })
}

function getUserTrackCount (uid) {
    uid = uid || currentUser().uid;

    return new Promise((resolve, reject) => {
        db.ref(`/users/${uid}/tracks`).once('value').then(snapshot => {
            let data = snapshot.val();
            let trackCount = Object.keys(data).length

            resolve(trackCount);
        })
    })
}

