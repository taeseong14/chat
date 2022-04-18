const isMobile = /Android/i.test(navigator.userAgent);

const chatScreen = document.getElementById('chatScreen');

(resizeDocument = function() {
    console.log("resizeDocument");
    
    const width = Math.min(innerWidth, outerWidth);
    const height = Math.min(innerHeight, outerHeight);
    
    // godown btn
    godown.style.left = viewMsgList.offsetLeft + viewMsgList.offsetWidth - 30 + 'px';
    godown.style.top = viewMsgList.offsetTop + viewMsgList.offsetHeight - 30 + 'px';
    
    // chatScreen
    chatScreen.style['margin'] = `${height/10|0}px auto 0 auto`;
    chatScreen.style.height = window.innerHeight - chatScreen.offsetTop * 2 + 'px';
    
    // msgForm top
    msgForm.style.top = chatScreen.offsetTop + chatScreen.offsetHeight - msgForm.offsetHeight + 'px';

    // msg viewer
    viewMsgList.style.height = chatScreen.offsetHeight - msgForm.offsetHeight + 'px';
    
    // emoji tab
    emojiTab.style.top = chatScreen.offsetTop - 250 + 'px';
})();

window.addEventListener('resize', resizeDocument);