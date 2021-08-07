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
        this.name = info.name;
    }
    setTrack (url, info) {
        this.player.src = url;

    }
    play() {
        this.player.play();
    }
    pause() {
        this.player.pause();
    }
    addEventListener(event, callback) {
        this.player.addEventListener(event, callback);
    }
}

var audio;


async function setTrack (url) {
    let Media = new Audio(url);

    Media.addEventListener('loadedmetadata', async () => {
        let trackInfo = await getTrackInfo(url).catch(err => {
            console.error(err);
        });

        audio = new AudioTrackPlayer(Media, trackInfo)
        displayTrackData(audio)

        Page.init();
    })

    Media.addEventListener('ended', () => {
        audioPlayButton._isPlaying ? stopProgress('@audioEnded') : null;
    })
}

setTrack('https://cdn.filestackcontent.com/sZYmptisQOqTI6AAYB00');

function getTrackInfo (url) {
    return new Promise((resolve, reject) => {
        db.ref(`/tracks`).orderByChild('url').equalTo(url).get().then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val();
                let track = data[Object.keys(data)[0]]
                resolve(track);
            } else {
                reject('Track not found');
            }
        })
    })
}

getTrackInfo('https://cdn.filestackcontent.com/sZYmptisQOqTI6AAYB00')

function displayTrackData (player) {
    let durationEl = dQS('.x252-zo3Vw2');
    durationEl.dataset.duration = player.trackDuration
    durationEl.textContent = moment.duration(player.trackDuration, "seconds").format('m:ss', { trim: false });
}

function setProgressDuration (time, end, isScrubbing=false) {
    let barWidth = new Percentage(time).isWhatPercentOf(end);

    let progressBar = document.querySelector('.progress-bar');
    if (isScrubbing) {
        progressBar.style.transition = 'width 0s';
    } else {
        progressBar.style.transition = null;
    }
    progressBar.style.width = barWidth + '%';

    return barWidth;
}


function increaseProgress (step) {
    let currentSeconds = parseFloat(parseFloat(document.querySelector('.x053-zo3Vw2').dataset.current).toFixed(6));
    let endSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);

    setProgressDuration((currentSeconds + step ?? 1), endSeconds);
    
    document.querySelector('.x053-zo3Vw2').textContent = moment.duration(Math.round(currentSeconds), "seconds").format('m:ss', { trim: false });
    document.querySelector('.x053-zo3Vw2').dataset.current = (currentSeconds + step ?? 1);
}

let progressLoopTimeout;
let progressAnimationTimeout;

function stopProgress (orig) {
    let currentSeconds = parseFloat(parseFloat(document.querySelector('.x053-zo3Vw2').dataset.current).toFixed(6));
    let endSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);

    if (currentSeconds == endSeconds || currentSeconds > endSeconds) {
        if (audioPlayButton._isPlaying) {
            audioPlayButton.pause(document.querySelector('#bottom-right'));
        }
    }

    clearTimeout(progressAnimationTimeout);
    clearTimeout(progressLoopTimeout);
    console.warn('STOPPING AUDIO', orig);
}

function progressLoop (isPlaying) {
    if (isPlaying == false || audioPlayButton._isPlaying == false) return stopProgress();
    let animationStep = 0.5; // seconds

    let currentSeconds = parseFloat(parseFloat(document.querySelector('.x053-zo3Vw2').dataset.current).toFixed(6));
    let endSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);

    if (currentSeconds == endSeconds || currentSeconds > endSeconds) {
        if (audioPlayButton._isPlaying) {
            audioPlayButton.pause(document.querySelector('#bottom-right'));
        }
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


    document.querySelector('.x053-zo3Vw2').textContent = moment.duration(seconds, "seconds").format('m:ss', { trim: false });
    document.querySelector('.x053-zo3Vw2').dataset.current = seconds;
    setProgressDuration(seconds, parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration), isScrubbing)

    audio.player.currentTime = seconds;
    //console.log('Setting audio time to ' + seconds + ' seconds')
}

audioPlayButton.onPlay(isPlaying => {
    let currentSeconds = parseInt(document.querySelector('.x053-zo3Vw2').dataset.current)
    let endSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);

    if (currentSeconds == endSeconds) {
        console.log('Audio has ended, starting from beginning');
        setAudioCurrentTime(0);
    }

    isPlaying ? audio.play() : audio.pause();
    isPlaying ? playNoAction(document.querySelector('#main-massive')) : pauseNoAction(document.querySelector('#main-massive'));
    console.log('RECIEVED ONPLAY CALLBACK, isPlaying=', isPlaying);
    
    progressLoop(isPlaying);
})


const progressBarWrapper = document.querySelector('.player-box');

progressBarWrapper.onmousedown = (e) => {
    progressBarClickEvent(e);
    audioHandleMouseDown(e, false);
}

const audioHandleMouseDown = (mouseDownEvent, fromHandle) => {
    progressBarWrapper.onclick = () => {}

    mouseDownEvent.preventDefault();

    console.log('Bar Handle Grabbed')
    
    document.querySelector('.music-player-wrapper').onmousemove = (e) => {
        let rect = document.querySelector('.rectangle-1-zo3Vw2').getBoundingClientRect();
        let x = e.clientX - rect.left; //x position within the element.
    
        if (x < 0) {
            x = 0;
        }

        if (x > rect.width) {
            x = rect.width;
        }

        let audioDurationSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);
        let seconds = new Percentage(new Percentage(x).isWhatPercentOf(rect.width)).percentOf(audioDurationSeconds);
    
        setAudioCurrentTime(Math.round(seconds), true);
    }


    document.onmouseup = (mouseUpEvent) => {
        document.onmouseup = (e) => {}
        document.querySelector('.music-player-wrapper').onmousemove = (e) => {}

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

function progressBarClickEvent (e) {
    var rect = document.querySelector('.rectangle-1-zo3Vw2').getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top; //y position within the element.

    if (x < 0) {
        x = 0;
    }

    if (x > rect.width) {
        x = rect.width;
    }

    let audioDurationSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);
    let seconds = new Percentage(new Percentage(x).isWhatPercentOf(rect.width)).percentOf(audioDurationSeconds);

    //console.log(x, y, new Percentage(x).isWhatPercentOf(rect.width))

    setAudioCurrentTime(Math.round(seconds));
}
