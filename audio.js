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



function progressDuration (time, end) {
    let progressBar = document.querySelector('.progress-bar');
    let barWidth = new Percentage(time).isWhatPercentOf(end);
    progressBar.style.width = barWidth + '%';

    return barWidth;
}


function increaseProgress (step) {
    let currentSeconds = parseFloat(parseFloat(document.querySelector('.x053-zo3Vw2').dataset.current).toFixed(6));
    let endSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);

    //console.log(currentSeconds);

    progressDuration((currentSeconds + step ?? 1), endSeconds);
    
    document.querySelector('.x053-zo3Vw2').textContent = moment.duration(Math.round(currentSeconds), "seconds").format('m:ss', { trim: false });
    document.querySelector('.x053-zo3Vw2').dataset.current = (currentSeconds + step ?? 1);
}

let progressLoopTimeout;
let progressAnimationTimeout;

function stopProgress () {
    clearTimeout(progressAnimationTimeout);
    clearTimeout(progressLoopTimeout);
    console.warn('stopping progress');
}

function progressLoop (isPlaying) {
    if (isPlaying == false) return stopProgress();
    let animationStep = 0.5; // seconds

    increaseProgress(animationStep);
    
    progressLoopTimeout = setTimeout(progressLoop, animationStep * 1000)
}


function setAudioCurrentTime (seconds) {
    audio.pause();
    stopProgress();

    document.querySelector('.x053-zo3Vw2').textContent = moment.duration(seconds, "seconds").format('m:ss', { trim: false });
    document.querySelector('.x053-zo3Vw2').dataset.current = seconds;
    progressDuration(seconds, parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration))

    audio.currentTime = seconds;

    if (audioPlayButton._isPlaying) {
        audio.play();
        audioPlayButton.isPlaying = true;
    }
}

audioPlayButton.onPlay(isPlaying => {
    isPlaying ? audio.play() : audio.pause();
    console.log('button state', isPlaying);
    progressLoop(isPlaying);
})

audio.addEventListener('ended', (event) => {
    stopProgress()
})

document.querySelector('.rectangle-1-zo3Vw2').onclick = function clickEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.

    let audioDurationSeconds = parseInt(document.querySelector('.x252-zo3Vw2').dataset.duration);
    let seconds = new Percentage(new Percentage(x).isWhatPercentOf(rect.width)).percentOf(audioDurationSeconds);

    console.log(seconds)
    setAudioCurrentTime(Math.round(seconds));
}