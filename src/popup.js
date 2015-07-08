var executeCopy = function (text) {
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
};

var queueNode = document.getElementById('queue'),
    queueItemTmpl = document.getElementById('queue-item').innerHTML,
    queue = null;

var render = function () {
  chrome.runtime.getBackgroundPage(function (wnd) {
    queue = wnd.galleriesQueue;

    queue.forEach(function (item, index) {
      item.id = index;

      if (item.status === 'complete') {
        item.isComplete = true;
      }
    });

    queueNode.innerHTML = Mustache.render(queueItemTmpl, { queue:queue });
  });
};

queueNode.addEventListener('click', function (e) {
  var el = e.target,
      item;

  if (el.dataset.id) {
    item = queue[el.dataset.id];
    urls = item.downloadUrls.join('\n');
    executeCopy(urls);
    item.isCopied = true;

    render();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.pull) {
    render();
  }
});

render();
