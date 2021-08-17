class plugPage {
    constructor(title, description) {
        this.title = title;
        this.description = description;
    }
    init() {
        animatePageInit();
    }
    animate (selector, options={
        action: 'remove', 
        actionSelector: 'waiting',
        transitionDuration: '0.3',
        transitionType: 'ease',
        removeTransitionAfter: true,
    }) {
        let el = document.querySelector(selector);
        el.style.transition = `${options.transitionDuration}s ${options.transitionType}`;

        let validActions = ['add', 'remove', 'toggle'];

        if (validActions.includes(options.action)) {
            el.classList[options.action](options.actionSelector)
    
            setTimeout(() => {
                if (options.removeTransitionAfter) {
                    el.style.transition = null;
                }
            }, parseFloat(options.transitionDuration) * 1000)
        } else {
            console.error('Invalid action')
        }
    }
}

const Page = new plugPage();

const dQS = (selector) => document.querySelector(selector);
    

function animatePageInit() {
    setTimeout(() => {
        dQS('.track-view .rectangle-top-left').classList.remove('waiting')
        setTimeout(() => {
            dQS('.bg-waves').style.willChange = 'height, opacity'
            dQS('.bg-waves').classList.remove('waiting')
            setTimeout(() => {
                dQS('.bg-waves').style.willChange = null;
            }, 2000)
        }, 300)
    }, 300)
}

function animateInBottomBar() {
    if (document.querySelector('.bottom-bar-outer').classList.contains('waiting')) {
        Page.animate('.bottom-bar-outer', { 
            action: 'remove',
            actionSelector: 'waiting',
            transitionDuration: '0.3',
            transitionType: 'ease-out',
            removeTransitionAfter: true,
        })
    } 
}

function cacheActions () {
    const getCache = (key) => {
        let item = localStorage.getItem(key);
        return item;
    }

    if (getCache('lastCachedTrack')) {
        let track = JSON.parse(getCache('lastCachedTrack'));
        // Animate bottom bar using the corresponding data from the track
        //
        animateInBottomBar();
    }
}