const FILESTACK_API_KEY = 'ALxoEda6VQ76Ilj7wYtGEz';


// Get a reference to the file input element
const uploadElement = document.querySelector('#pond-upload');

// Create a FilePond instance
const pond = FilePond.create(uploadElement, {
    server: {
        url: 'https://api.sound.farm/audiofiles',
        load: (res) => {
            console.log(res);
        },
        error: (res) => {
            console.log(res);
        },
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            // fieldName is the name of the input field, file is the actual file object to send
            const formData = new FormData();
            formData.append(fieldName, file, file.name);

            let trackName = document.querySelector('#track-name')?.value || file.name.substring(0, 10);

            const request = new XMLHttpRequest();
            request.open('POST', `https://www.filestackapi.com/api/store/S3?filename=${trackName}&key=ALxoEda6VQ76Ilj7wYtGEz`);
            request.setRequestHeader('Content-Type', 'audio/mpeg')

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
                  saveTrackUrl(JSON.parse(request.response));
                }
            }
            
            request.send(file)
            
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
    oninit: () => {
        console.log('FilePond is ready');
    },
    onerror: (err) => {
        console.log('FilePond error:', err);
    },
    onprocessfile: (err, file) => {
        console.log('FilePond processed files', file);
    }
});


function createPlayer (audioURL) {
    let template = `
    <audio controls>
        <source src="${audioURL}" type="audio/mpeg">
    </audio>
    `

    let wrapper = document.createElement('div')
    wrapper.innerHTML = template;

    document.body.appendChild(wrapper)
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source;



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

function saveTrackUrl (uploadResponseData) {
    console.log(uploadResponseData)

    let trackURL = uploadResponseData.url;
    let trackID = trackURL.replace(/https:\/\/cdn\.filestackcontent\.com\//, '');
    
    let trackName = uploadResponseData.filename;
    
    db.ref(`/tracks/${trackID}`).set({
        url: trackURL,
        name: trackName,
    })
}


function getTrackURL (id) {
    source = audioCtx.createBufferSource();
    var request = new XMLHttpRequest();

    request.open('GET', `http://localhost:3000/testtrack/${id}`, true);

    request.responseType = 'arraybuffer';

    request.onload = function() {
        
        var audioData = request.response;
        console.log('Decoding:', audioData)

        var fileReader = new FileReader();
        fileReader.onload = () => {
            let arrayBuffer = audioData;
            console.log(arrayBuffer)
        }
        fileReader.readAsArrayBuffer(audioData);

        return;
        audioCtx.decodeAudioData(audioData, function(buffer) {
            source.buffer = buffer;
    
            let audioFile = new Blob(buffer, {type: 'audio/mpeg'});
            let audioURL = URL.createObjectURL(audioFile);
            console.log(audioURL);

            source.connect(audioCtx.destination);
            source.loop = true;
          },
    
          function(e){ console.log("Error with decoding audio data" + e.err); });
    
        } 
    
    request.send();
}