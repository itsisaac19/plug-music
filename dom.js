function setInfoHeight () {
    let wrapper = document.querySelector('.moreinfo')
    wrapper.style.height = (wrapper.scrollHeight + 200) + 'px'
}
setInfoHeight()