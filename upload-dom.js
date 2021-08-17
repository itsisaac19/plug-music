class PageOperator {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }
    init() {
        pageInit();
    }
}
const Page = new PageOperator();

function pageInit() {
    let mainContent = document.querySelector('.main-content');
    mainContent.classList.remove('hidden')
}

