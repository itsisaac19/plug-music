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

class Percentage {
    constructor(value) {
        this.value = value;
    }

    isWhatPercentOf(value) {
        return ((this.value / value) * 100).toFixed(2);
    }

    percentOf(value) {
        return ((this.value / 100) * value).toFixed(2);
    }
}

class AudioTrackPlayer {
    constructor (player, info) {
        this.player = player;
        this.src = this.player.src;
        this.trackDuration = Math.round(this.player.duration);
        this.artist = info.artist;
        this.title = info.title;
        this.lyrics = info.lyrics;
        this.description = info.description;
    }
    setTrack (url, info) {
        this.player.src = url;

    }
    play() {
        this.player.play();
        nowPlaying(this, true);
    }
    pause() {
        this.player.pause();
        nowPlaying(this, false);
    }
    addEventListener(event, callback) {
        this.player.addEventListener(event, callback);
    }
    currentTime() {
        return parseFloat(parseFloat(document.querySelector('.player-currentTime').dataset.current).toFixed(6));
    }    
}

function streamTrackFromURL (callback) {
    let searchParams = new URL(location.href).searchParams;
    if (searchParams.has('id')) {
        let id = searchParams.get('id');
        streamAudio(id, callback);
    } else {
        location.href = `/users.html` 
    }
}


var audio;

async function streamAudio (id, callback) {
    let Media;
    let track; 

    console.log('Searching for track: ' + id);
    track = await getTrackInfo(id).catch(err => console.error(err));

    console.log(`FIREBASE @/tracks/${id}`, track)
    Media = new Audio(track.data);

    Media.addEventListener('loadedmetadata', async () => {
        audio = new AudioTrackPlayer(Media, track.info)
        console.log(audio);

        Media.onpause = () => {
            if (audioPlayButton._isPlaying == true) {
                dQS('#bottom-right').click();
            }
        }
        Media.onplay = () => {
            if (audioPlayButton._isPlaying == false) {
                dQS('#bottom-right').click();
            }
        }

        // Callback
        callback();
        // Display Track information i.e. artist, title
        displayTrackData(audio)
        // Initialize Page Entry Animations
        Page.init();
    })

    // When the track is finished, stop the progress bar
    Media.addEventListener('ended', () => {
        audioPlayButton._isPlaying ? stopProgress('@audioEnded') : null;
    })
}

function getTrackInfo (id) {
    return new Promise((resolve, reject) => {
        db.ref(`/tracks`).child(id).get().then((snapshot) => {
            if (snapshot.exists()) {
                let track = snapshot.val();
                resolve(track);
            } else {
                reject('Track not found');
            }
        })
    })
}

function deleteTrack (id) {
    return new Promise((resolve, reject) => {
        db.ref(`/tracks/${id}`).remove();
    })
}

function displayTrackData (player) {
    let durationEl = dQS('.player-endTime');
    durationEl.dataset.duration = player.trackDuration
    durationEl.textContent = moment.duration(player.trackDuration, "seconds").format('m:ss', { trim: false });

    dQS('.track-title').innerHTML = player.title;
    dQS('.track-artist').innerHTML = player.artist;

    dQS('.track-artist-details').innerHTML = player.description;
    dQS('.track-lyrics').innerHTML = player.lyrics;
}

function nowPlaying (track, playing) {
    if (playing) {
        dQS('.track-playing-title').classList.remove('paused')
        dQS('.track-playing-artist').innerHTML = track.artist;
        dQS('.track-playing-title').innerHTML = track.title;
    } else {
        dQS('.track-playing-title').classList.add('paused')
    }
}

function setProgressDuration (time, isScrubbing=false) {
    dQS('.progress-bar').style.transition = isScrubbing ? 'width 0s' : null;
    dQS('.progress-bar').style.width = new Percentage(time).isWhatPercentOf(audio.trackDuration) + '%';
}

function increaseProgress (step=1) {
    setProgressDuration(audio.currentTime() + step);
    
    dQS('.player-currentTime').textContent = moment.duration(Math.round(audio.currentTime()), "seconds").format('m:ss', { trim: false });
    dQS('.player-currentTime').dataset.current = audio.currentTime() + step;
}

let progressLoopTimeout;
let progressAnimationTimeout;

function stopProgress (orig) {
    if (audio.currentTime() >= audio.trackDuration && audioPlayButton._isPlaying) {
        audioPlayButton.pause(document.querySelector('#bottom-right'));
    }

    clearTimeout(progressAnimationTimeout);
    clearTimeout(progressLoopTimeout);
    console.warn('STOPPING AUDIO', orig);
}

function progressLoop (isPlaying) {
    if (isPlaying == false || audioPlayButton._isPlaying == false) return stopProgress('@increaseProgress: isPlaying or _isPlaying = false');
    let animationStep = 0.5; // seconds

    if (audio.currentTime() >= audio.trackDuration && audioPlayButton._isPlaying) {
        audioPlayButton.pause(document.querySelector('#bottom-right'));
        return stopProgress('@increaseProgress');
    }

    increaseProgress(animationStep);
    progressLoopTimeout = setTimeout(progressLoop, animationStep * 1000)
}


function setAudioCurrentTime (seconds, isScrubbing=false) {
    if (audioPlayButton._isPlaying == false) {
        audio.pause();
        stopProgress('@setAudioCurrentTime');
    }


    document.querySelector('.player-currentTime').textContent = moment.duration(seconds, "seconds").format('m:ss', { trim: false });
    document.querySelector('.player-currentTime').dataset.current = seconds;

    setProgressDuration(seconds, isScrubbing)

    audio.player.currentTime = seconds;
    console.log('Setting audio time to ' + seconds + ' seconds')
}

// Listen to play button state changes

audioPlayButton.onPlay(isPlaying => {
    console.log('RECIEVED ONPLAY CALLBACK, isPlaying=', isPlaying);

    if (audio.currentTime() >= audio.trackDuration) {
        console.log('Audio has ended, starting from beginning');
        setAudioCurrentTime(0);
    }

    if (audioPlayButton.timesPressed == 1) {
        animateInBottomBar()
    }

    isPlaying ? audio.play() : audio.pause();
    isPlaying ? playNoAction(document.querySelector('#main-massive')) : pauseNoAction(document.querySelector('#main-massive'));
    
    progressLoop(isPlaying);
})


// Track Player Events

const progressBarWrapper = document.querySelector('.player-box');

progressBarWrapper.onmousedown = (e) => {
    progressBarClickEvent(e);
    audioHandleMouseDown(e, false);
    console.log(e)
}

function progressBarClickEvent (e) {
    var rect = document.querySelector('.player-box').getBoundingClientRect();
    let xCoord = e.clientX - rect.left; //x position within the element.
    
    if (xCoord < 0) xCoord = 0;
    if (xCoord > rect.width) xCoord = rect.width;
    

    let xPercentage = new Percentage(xCoord).isWhatPercentOf(rect.width)
    let seconds = new Percentage(xPercentage).percentOf(audio.trackDuration);

    setAudioCurrentTime(Math.round(seconds), true);
}

const audioHandleMouseDown = (mouseDownEvent) => {
    progressBarWrapper.onclick = () => {}
    mouseDownEvent.preventDefault();

    console.log('Bar Handle Grabbed')
    
    document.querySelector('.player-box').onmousemove = (e) => {
        let rect = document.querySelector('.player-box').getBoundingClientRect();
        let xCoord = e.clientX - rect.left; //x position within the element.
    
        if (xCoord < 0) xCoord = 0;
        if (xCoord > rect.width) xCoord = rect.width;
        

        let xPercentage = new Percentage(xCoord).isWhatPercentOf(rect.width)
        let seconds = new Percentage(xPercentage).percentOf(audio.trackDuration);
    
        setAudioCurrentTime(Math.round(seconds), true);
    }

    document.onmouseup = (mouseUpEvent) => {
        document.onmouseup = () => {}
        document.querySelector('.player-box').onmousemove = () => {}

        let mouseUpX = mouseUpEvent.clientX;
        let mouseDownX = mouseDownEvent.clientX;

        if (mouseUpX == mouseDownX || Math.abs(mouseUpX - mouseDownX) < 5) {
            console.log('NO / LOW DRAG DIFF');
            return;
        }

        progressBarClickEvent(mouseUpEvent);
        progressBarWrapper.onclick = progressBarClickEvent;
    }
}

document.querySelector('.handle').onmousedown = audioHandleMouseDown;
