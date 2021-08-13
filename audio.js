var db;

if (!offline) {
    firebase.initializeApp({
        apiKey: "AIzaSyAhWA9p5XPVlnTLKZPMt7D5lPqcgjPGLAY",
        authDomain: "plug-music-app-database.firebaseapp.com",
        databaseURL: "https://plug-music-app-database-default-rtdb.firebaseio.com",
        projectId: "plug-music-app-database",
        storageBucket: "plug-music-app-database.appspot.com",
        messagingSenderId: "1053988739108",
        appId: "1:1053988739108:web:218b4bd545c21269eea0b1"
    });
    db = firebase.database();
}



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
        return parseFloat(parseFloat(document.querySelector('.x053-zo3Vw2').dataset.current).toFixed(6));
    }    
}

var audio;


async function setTrack (id) {
    let Media;
    let track; 

    if (!offline) {
        console.log('Searching for track ' + id);
        track = await getTrackInfo(id).catch(err => console.error(err));
        console.log(track)
        Media = new Audio(track.url);
    } else {
        track = {
            "artist": "Andrea Chahayed",
            "description": "Uprising from LA, young singer and songwriter Andrea Chahayed has released just a few songs including ‘Right Where You Like’, ‘The Words’, and most popular ‘Tenant’",
            "id": "ogtrack",
            "lyrics": "Say you want the best for me<br>And try to see yourself in all my dreams<br>Then I can be enough for you right now<br><br>As long as I can walk the rope you found<br>Somehow<br><br>So I tell myself<br>That I might be a moment away hey hey<br>From the girl that you want me to date<br>Chase the sun in December<br>I can't remember<br>Why I feel so incomplete<br><br>Tell me who you want to see<br>It didn't happen if it's just for me<br>And know I hope you know I'm still alive<br>Can't feel my heart beat 'til I know I'm right<br><br>So I tell myself<br>That I might be a moment away hey hey<br>From the girl that you want me to date<br>Chase the Sun in December<br>I can't remember<br>Why I feel so incomplete<br><br>So I tell myself<br>That I might be a moment away hey hey<br>From the girl that you want me to date<br>Chase the Sun in December<br>I can't remember<br>Why I feel so incomplete<br><br>Try and talk to me<br>Like I've got no sense in my reality<br>But all I see<br>Is the imaginary life you've painted me<br>I know I look pretty<br>Hanging up high on your mountop piece<br><br>I know I burn nicely<br>Sitting in the fire that you set in me<br>In me<br>In me<br>In me",
            "title": "Right Where You Like",
            "url": "https://cdn.filestackcontent.com/VYan2LzrRkGvIRjPPGLS"
        }
        Media = new Audio('rightWhereYouLike.mp3');
    }


    Media.addEventListener('loadedmetadata', async () => {
        audio = new AudioTrackPlayer(Media, track)
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

setTrack('ogtrack');

function getTrackInfo (id) {
    return new Promise((resolve, reject) => {
        db.ref(`/tracks`).orderByChild('id').equalTo(id).get().then((snapshot) => {
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

function deleteTrack (id) {
    return new Promise((resolve, reject) => {
        db.ref(`/tracks/${id}`).remove();
    })
}

function displayTrackData (player) {
    let durationEl = dQS('.x252-zo3Vw2');
    durationEl.dataset.duration = player.trackDuration
    durationEl.textContent = moment.duration(player.trackDuration, "seconds").format('m:ss', { trim: false });

    dQS('.track-title').innerHTML = player.title;
    dQS('.track-artist').innerHTML = player.artist;

    dQS('.track-artist-details').innerHTML = player.description;
    dQS('.track-lyrics').innerHTML = player.lyrics;
}

function nowPlaying (track, playing) {
    if (playing) {
        dQS('.now-playing-track-title').classList.remove('paused')
        dQS('.now-playing-track-title').innerHTML = track.title;
    } else {
        dQS('.now-playing-track-title').classList.add('paused')
        dQS('.now-playing-track-title').innerHTML = track.title + '<span class="pausedHinter">&nbsp; Paused<span>';
    }
}

function setProgressDuration (time, isScrubbing=false) {
    dQS('.progress-bar').style.transition = isScrubbing ? 'width 0s' : null;
    dQS('.progress-bar').style.width = new Percentage(time).isWhatPercentOf(audio.trackDuration) + '%';
}

function increaseProgress (step=1) {
    setProgressDuration(audio.currentTime() + step);
    
    dQS('.x053-zo3Vw2').textContent = moment.duration(Math.round(audio.currentTime()), "seconds").format('m:ss', { trim: false });
    dQS('.x053-zo3Vw2').dataset.current = audio.currentTime() + step;
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


    document.querySelector('.x053-zo3Vw2').textContent = moment.duration(seconds, "seconds").format('m:ss', { trim: false });
    document.querySelector('.x053-zo3Vw2').dataset.current = seconds;

    setProgressDuration(seconds, isScrubbing)

    audio.player.currentTime = seconds;
    //console.log('Setting audio time to ' + seconds + ' seconds')
}

// Listen to play button state changes

audioPlayButton.onPlay(isPlaying => {
    console.log('RECIEVED ONPLAY CALLBACK, isPlaying=', isPlaying);

    if (audio.currentTime() >= audio.trackDuration) {
        console.log('Audio has ended, starting from beginning');
        setAudioCurrentTime(0);
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
}

function progressBarClickEvent (e) {
    var rect = document.querySelector('.rectangle-1-zo3Vw2').getBoundingClientRect();
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
    
    document.querySelector('.music-player-wrapper').onmousemove = (e) => {
        let rect = document.querySelector('.rectangle-1-zo3Vw2').getBoundingClientRect();
        let xCoord = e.clientX - rect.left; //x position within the element.
    
        if (xCoord < 0) xCoord = 0;
        if (xCoord > rect.width) xCoord = rect.width;
        

        let xPercentage = new Percentage(xCoord).isWhatPercentOf(rect.width)
        let seconds = new Percentage(xPercentage).percentOf(audio.trackDuration);
    
        setAudioCurrentTime(Math.round(seconds), true);
    }

    document.onmouseup = (mouseUpEvent) => {
        document.onmouseup = () => {}
        document.querySelector('.music-player-wrapper').onmousemove = () => {}

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
