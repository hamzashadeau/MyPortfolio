const nav = document.querySelector(".nav-bar");
window.addEventListener('scroll',() => {
    if(window.screenY>500){
        nav.classList.add('scroll');
    }
});