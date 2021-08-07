class plugPage {
    constructor(title, description) {
        this.title = title;
        this.description = description;
    }
    init() {
        animatePageInit();
    }
}

const Page = new plugPage();

const dQS = (selector) => document.querySelector(selector);
    

function animatePageInit() {
    let footerLeft = document.querySelector('.bottom-left');
    let footerCenter = document.querySelector('.rectangle-4-zo3Vw2');
    let footerRight = document.querySelector('.rectangle-6-zo3Vw2');
    let footerDivider = document.querySelector('.rectangle-8-zo3Vw2');

    let elements = [footerLeft, footerRight, footerCenter, footerDivider];

    elements.forEach(el => {
        el.style.transition = '0.3s ease-out'
        el.classList.remove('waiting')
    })

    setTimeout(() => {
        dQS('.track-view .rectangle-top-left').classList.remove('waiting')
        setTimeout(() => {
            dQS('.bg-waves').style.willChange = 'height, opacity'
            dQS('.bg-waves').classList.remove('waiting')
            setTimeout(() => {
                dQS('.bg-waves').style.willChange = null;
            }, 2000)
        }, 300)
        elements.forEach(el => {
            el.style.transition = null
        })
    }, 300)
}


