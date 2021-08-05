const FILESTACK_API_KEY = 'ALxoEda6VQ76Ilj7wYtGEz';
const client = filestack.init(FILESTACK_API_KEY);


// Get a reference to the file input element
const uploadElement = document.querySelector('#pond-upload');

// Create a FilePond instance
const pond = FilePond.create(uploadElement, {
    server: {
        url: 'http://localhost:3000/testtrack',
        load: (res) => {
            console.log(res);
        },
        error: (res) => {
            console.log(res);
        },
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            // fieldName is the name of the input field
            // file is the actual file object to send
            const formData = new FormData();
            formData.append(fieldName, file, file.name);

            const request = new XMLHttpRequest();
            request.open('POST', 'http://localhost:3000/testtrack');

            // Should call the progress method to update the progress to 100% before calling load
            // Setting computable to false switches the loading indicator to infinite mode
            request.upload.onprogress = (e) => {
                progress(e.lengthComputable, e.loaded, e.total);
            };

            // Should call the load method when done and pass the returned server file id
            // this server file id is then used later on when reverting or restoring a file
            // so your server knows which file to return without exposing that info to the client
            request.onload = function () {
                if (request.status >= 200 && request.status < 300) {
                    // the load method accepts either a string (id) or an object
                    load(request.responseText);
                } else {
                    // Can call the error method if something is wrong, should exit after
                    error('oh no');
                }
            };

            console.log(file);
            console.log(formData, metadata);
            request.send(formData);

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


function upload (fileData) {
    client.upload(fileData).then(res => {
        console.log('success: ', res)
    }).catch(err => {
        console.log(err)
    });
}


document.querySelector('.uploadFileButton').onclick = () => {
    const file = pond.getFile().file;
    upload(file);
    console.log(file)

    return;
    let songTitle = document.querySelector('#songTitle').value;
    let songArtist = document.querySelector('#songArtist').value;

    if (!songTitle || !songArtist) {
        alert('Please enter a song title and artist');
        return;
    }

    let options = {
        uploadConfig: {
            tags: {
                 "title": songTitle,
                "artist": songArtist,   
            }
        },
        fromSources: ["local_file_system", "audio"],
        accept: ["audio/*"],
        onUploadDone: files => {
            console.log(files)
        }
    };

    client.picker(options).open();
}


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

function getTrackURL (id) {
    fetch(`http://localhost:3000/testtrack/${id}`)
    .then(res => res.json())
    .then(res => {
        let audioBufferData = JSON.parse(res.content);
        console.log(audioBufferData)
        return
        let audioArray = new Uint8Array(audioBufferData.data);
        let audioFile = new Blob(audioBufferData.data, {type: 'audio/mpeg'});

        let audioURL = URL.createObjectURL(audioFile);
        console.log(audioBufferData, audioURL, audioFile);

        createPlayer(audioURL);

        return audioURL;
    });
}