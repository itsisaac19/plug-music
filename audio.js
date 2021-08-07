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


var audio = new Audio('rightWhereYouLike.mp3');



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

    audio.currentTime = seconds;
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

audio.addEventListener('ended', () => {
    audioPlayButton._isPlaying ? stopProgress('@audioEnded') : null;
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
