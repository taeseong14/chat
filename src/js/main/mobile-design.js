const chatScreen = document.getElementById('chatScreen');

(resizeDocument = function() {
    console.log("resizeDocument");
    // godown btn
    godown.style.left = viewMsgList.offsetLeft + viewMsgList.offsetWidth - 30 + 'px';
    godown.style.top = viewMsgList.offsetTop + viewMsgList.offsetHeight - 30 + 'px';

    // chatScreen Height
    chatScreen.style.height = window.innerHeight - chatScreen.offsetTop * 2 + 'px';
})();

window.addEventListener('resize', resizeDocument);