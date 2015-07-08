var feedButton = document.querySelector('.feedbutton');

if (feedButton) {
  chrome.runtime.sendMessage({
    feed: {
      url: feedButton.href
    }
  });
}