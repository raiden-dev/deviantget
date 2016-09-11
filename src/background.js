var getUrlDocument = function (url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.responseXML) {
          resolve(xhr.responseXML);
        }
        else {
          resolve(
            (new DOMParser())
              .parseFromString(xhr.responseText, 'text/html')
          );
        }
      }
    };

    xhr.send();
  });
};

var uniqueFeeds = [];

window.galleriesQueue = [];

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (!sender.tab) {
    return;
  }

  var gallery = {
    title: sender.tab.title,
    url: sender.tab.url,
    status: 'collecting',
    downloadUrls: []
  };

  // Show icon
  chrome.pageAction.show(sender.tab.id);

  if (uniqueFeeds.indexOf(request.feed.url) !== -1) {
    return;
  }
  else {
    uniqueFeeds.push(request.feed.url);
  }

  window.galleriesQueue.push(gallery);

  // Set loading title
  chrome.pageAction.setTitle({
    tabId: sender.tab.id,
    title: 'Collecting the urls…'
  });

  getUrlDocument(request.feed.url).then(function (dom) {
    var guids = dom.getElementsByTagName('guid'),
        itemUrls = [].map.call(guids, function (guid) {
          return guid.innerHTML;
        });

    itemUrls.forEach(function (url, index) {
      getUrlDocument(url).then(function (dom) {
        //console.trace("Fetched:" + url);
        var downloadButton = dom.querySelector('.dev-page-download');
        var titleLabel = dom.querySelector("h1 a").innerText;
        var dateLabel = dom.querySelector("dd span").innerText;
        
        if (downloadButton) {
            var values = [downloadButton.href, url, titleLabel];
            var date = new Date(dateLabel);
            var ds = date.toISOString();
            ds = ds.substring(0, ds.indexOf("T"))
            values.push(ds)
            gallery.downloadUrls.push(values);
        }

        if (index === itemUrls.length - 1) {
          // Set done title
          chrome.pageAction.setTitle({
            tabId: sender.tab.id,
            title: 'The list is ready!'
          });

          gallery.status = 'complete';

          // Send the message to pull updates
          chrome.runtime.sendMessage({ pull:true });
        }
      });
    });
  });
});
