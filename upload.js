const FILESTACK_API_KEY = 'ALxoEda6VQ76Ilj7wYtGEz';
const file_io_API_KEY = '7O6BWVS.RJM0VBK-P4SMNQR-H823K5W-RWF4XWK'

// Get a reference to the file input element
const uploadElement = document.querySelector('#pond-upload');

(async () => {
    const filePond = await import('./filepond.js');
    console.log(filePond)
})



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
        url: 'https://file.io/',
        load: (res) => {
            console.log(res);
        },
        error: (res) => {
            console.log(res);
        },
        revert: (res) => {
            const file = JSON.parse(res);
            console.log(file);
            const request = new XMLHttpRequest();

            request.onreadystatechange = function() {
                if (request.readyState === 4) {
                  console.log('Deleted file');
                }
            }

            request.open('DELETE', `https://file.io/${file.key}`);
            request.setRequestHeader("Authorization", "Basic N082QldWUy5SSk0wVkJLLVA0U01OUVItSDgyM0s1Vy1SV0Y0WFdLOg==");
            request.send();
        },
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            // fieldName is the name of the input field, file is the actual file object to send
            const formData = new FormData();
            formData.append('file', file, file.name);

            let trackName = document.querySelector('#track-name')?.value || file.name.substring(0, 10);

            const request = new XMLHttpRequest();
            //request.withCredentials = true;

            request.open('POST', `https://file.io/`);
            request.setRequestHeader("Authorization", "Basic N082QldWUy5SSk0wVkJLLVA0U01OUVItSDgyM0s1Vy1SV0Y0WFdLOg==");

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
            
            request.send(formData)
            
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

    let trackURL = uploadResponseData.link;
    let trackID = uploadResponseData.key;
    //let trackID = trackURL.replace(/https:\/\/cdn\.filestackcontent\.com\//, '');
    //let trackName = uploadResponseData.filename;
    let trackName = uploadResponseData.name;
    
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