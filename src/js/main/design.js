const isMobile = /Android/i.test(navigator.userAgent);

const chatScreen = document.getElementById('chatScreen');

(resizeDocument = function() {
    console.log("resizeDocument");
    
    const width = Math.min(innerWidth, outerWidth);
    const height = Math.min(innerHeight, outerHeight);
    
    // chatScreen
    chatScreen.style['margin'] = `${height/10|0}px auto 0 auto`;
    chatScreen.style.height = window.innerHeight - chatScreen.offsetTop * 2 + 'px';
    
    // msgForm
    msgForm.style.top = chatScreen.offsetTop + chatScreen.offsetHeight - msgForm.offsetHeight + 'px';
    // replyTo
    replyTo.style.top = chatScreen.offsetTop + chatScreen.offsetHeight - msgForm.offsetHeight - replyTo.offsetHeight + 'px';
    
    // msg viewer
    viewMsgList.style.height = chatScreen.offsetHeight - msgForm.offsetHeight + 'px';

    // godown btn
    godown.style.left = viewMsgList.offsetLeft + viewMsgList.offsetWidth - 30 + 'px';
    godown.style.top = viewMsgList.offsetTop + viewMsgList.offsetHeight - 30 + 'px';
    
    // emoji tab
    emojiTab.style.top = chatScreen.offsetTop - 250 + 'px';

    // scroll
    viewMsgList.scrollTop = viewMsgList.scrollHeight;
})();

window.addEventListener('resize', resizeDocument);