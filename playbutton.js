class AudioButton {
  constructor(buttonElement) {
    this.button = buttonElement;
    this.isPlaying = false;
    this._isPlaying = false;
    this.timesPressed = 0;
  }
  play(button) {
    button.classList.remove('animate-reverse')
    button.classList.add('animate-fill')
    
    button.onclick = () => {
      audioPlayButton.pause(this.button)
    };

    audioPlayButton.timesPressed++;
    audioPlayButton.isPlaying = true;

    button.querySelectorAll('.icon')[0].innerHTML = '| |'
  }
  pause(button) {
    button.classList.add('animate-reverse')
    button.classList.remove('animate-fill')
    
    button.onclick = () => {
      audioPlayButton.play(this.button)
    };

    audioPlayButton.isPlaying = false;
    
    button.querySelectorAll('.icon')[0].innerHTML = `
    <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="37" height="43" viewBox="0 0 37 43">
      <path id="Polygon_1" data-name="Polygon 1" d="M21.5,0,43,37H0Z" transform="translate(37) rotate(90)" fill="#c8dce5"/>
    </svg>
    `
  }
  playButtonListener = (state) => {}
  onPlay(cb) {
    this.playButtonListener = cb;
  }
  set isPlaying (state) {
    this._isPlaying = state;
    this.playButtonListener(state)
  }
}
  
const audioPlayButton = new AudioButton(document.querySelector('#bottom-right'));
  
function playButton (buttonSelector, actions=true) {
  const button = document.querySelector(buttonSelector ?? '#button')
  
  button.onclick = () => {
    audioPlayButton.play(button)
  };

  button.addEventListener('mousedown', () => {
    button.classList.add('depressed')
    button.classList.remove('comingUp')
  })

  document.addEventListener('mouseup', () => {
    button.classList.remove('depressed')
    button.classList.add('comingUp')
  })
}
playButton('#bottom-right');
  
  
function playNoAction (button, fromSameOrigin) {

  if (fromSameOrigin == true) {
    //console.log('clicking bottom right');
    document.querySelector('#bottom-right').click();
    return;
  }

  button.classList.remove('animate-reverse')
  button.classList.add('animate-fill')
  
  button.onclick = () => {
    pauseNoAction(document.querySelector('#main-massive'), true)
  }
  button.querySelectorAll('.icon')[0].innerHTML = '| |'
}

function pauseNoAction (button, fromSameOrigin) {
  if (fromSameOrigin == true) {
    //console.log('clicking bottom right');
    document.querySelector('#bottom-right').click();
    return;
  }

  button.classList.add('animate-reverse')
  button.classList.remove('animate-fill')
  
  button.onclick = () => {
    playNoAction(document.querySelector('#main-massive'), true)
  }
  button.querySelectorAll('.icon')[0].innerHTML = '▶'
}

function assignInitalListeners () {
  document.querySelector('#main-massive').addEventListener('mousedown', () => {
    document.querySelector('#main-massive').classList.add('depressed')
    document.querySelector('#main-massive').classList.remove('comingUp')
  })
  
  document.addEventListener('mouseup', () => {
    document.querySelector('#main-massive').classList.remove('depressed')
    document.querySelector('#main-massive').classList.add('comingUp')
  })
  
  document.querySelector('#main-massive').onclick = () => {
    playNoAction(document.querySelector('#main-massive'), true)
  }
}
