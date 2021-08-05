class AudioButton {
    constructor(buttonSelector) {
        this.button = document.querySelector(buttonSelector);
        this.isPlaying = false;
        this._isPlaying = false;
    }
    playButtonListener = (state) => {}
    onPlay(cb) {
        this.playButtonListener = cb;
    }
    set isPlaying (state) {
        this.playButtonListener(state)
        this._isPlaying = state;
    }
}

const audioPlayButton = new AudioButton('.playButton');

function playButton (buttonSelector) {
    const button = document.querySelector(buttonSelector ?? '.button')
    button.onclick = play;
    
    function play () {
      button.focus()
      button.classList.remove('animate-reverse')
      button.classList.add('animate-fill')
      
      button.onclick = pause;
      audioPlayButton.isPlaying = true;
  
      document.querySelector('.icon').innerHTML = '| |'
    }
  
    function pause () {
      button.focus()
      button.classList.add('animate-reverse')
      button.classList.remove('animate-fill')
      
      button.onclick = play;
      audioPlayButton.isPlaying = false;
    
      document.querySelector('.icon').innerHTML = '▶'
    }
  
  
  
    button.addEventListener('mousedown', () => {
      button.classList.add('depressed')
      button.classList.remove('comingUp')
    })
  
    document.addEventListener('mouseup', () => {
      button.classList.remove('depressed')
      button.classList.add('comingUp')
    })
}
playButton('.playButton');



