
chrome.runtime.onInstalled.addListener(function() {
  console.log('proxy extenstion installed');
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {schemes: ['http', 'https']},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log('onActivated', activeInfo)
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log('onActivated call', tab)
    proxyReset(tab)
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('onUpdated', changeInfo, tab)
  if (changeInfo.url || tab.url || tab.pendingUrl) {
    console.log('onUpdated call', tab)
    proxyReset(tab)
  }
})

function proxyReset (tab: chrome.tabs.Tab) {
  console.log('proxyReset', tab)
  if (!tab.url && !tab.pendingUrl) {
    console.log('url is empty');
    return;
  }
  const globalEnableStr = localStorage.getItem('globalEnable');
  const globalEnable = globalEnableStr === 'true' ? true : false;
  if (!globalEnable) {
    proxyClear();
    return ;
  }
  const proxysStr = localStorage.getItem('proxys');
  const proxys: Rule[] = proxysStr ? JSON.parse(proxysStr) : [];
  const pacHttpList: string[] = [];
  proxys.filter((item) => item.enable).filter((item) => {
    const reg = new RegExp(item.reg)
    console.log(reg)
    if (reg.test(tab.url!) || ( tab.pendingUrl && reg.test(tab.pendingUrl) )) {
      return true;
    } else {
      return false;
    }
  }).forEach((item) => {
    const proxyList = item.hosts.filter(host => host.enable && host.domain && host.ip);
    pacHttpList.push(...proxyList.map((litem) => {
      return `if (host === "${litem.domain}" || shExpMatch(host, "${litem.domain}")) {
        var port = getPort(url, host);
        alert(port);
        return "PROXY ${litem.ip}:" + port + "; DIRECT";
      }`
    }));
  })
  const pacScript = `
  function getPort(url, host) {
    if (url.indexOf(host) === -1) {
      return "80";
    }
    var noHostStr = url.substring(url.indexOf(host) + host.length);
    if (noHostStr.indexOf(":") !== 0) {
      if (url.startsWith("http://")) {
        return "80";
      } else if (url.startsWith("https://")) {
        return "443";
      } else {
        return "80";
      }
    } else {
      var noPortIndex = noHostStr.indexOf("/");
      if (noPortIndex === -1) {
        noPortIndex = noHostStr.indexOf("?");
      }
      if (noPortIndex === -1) {
        noPortIndex = noHostStr.indexOf("#");
      }
      if (noPortIndex === -1) {
        noPortIndex = noPortIndex.length;
      }
      return noHostStr.substring(1, noPortIndex)
    }
  }
  function FindProxyForURL(url,host){
    if(shExpMatch(url, "http:*") || shExpMatch(url, "https:*")){
      ${pacHttpList.join('\n')}
      return "DIRECT";
    } else {
      return "DIRECT";
    }
  }
  `;
  if (pacHttpList.length > 0) {
    console.log(pacScript)
    chrome.proxy.settings.set({scope: 'regular', value:  {mode: 'pac_script', pacScript: {data: pacScript}}});
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/logo192.png',
      title: '代理中',
      message: '此tab.url已设置代理'
    }, () => {})
  } else {
    console.log('system')
    chrome.proxy.settings.set({scope: 'regular', value: {mode: 'system'}});
    // chrome.notifications.create({
    //   type: 'basic',
    //   iconUrl: '/logo192.png',
    //   title: '未代理',
    //   message: '此tab.url未设置代理'
    // }, () => {})
  }
}

function proxyClear () {
  chrome.proxy.settings.clear({}, () => {
    console.log('clear proxy');
  })
}

window.proxySubmit = function proxySubmit () {
  console.log('proxySubmit')
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    console.log('proxySubmit query', tabs)
    if (tabs.length > 1 || tabs.length === 0) {
      console.log(`符合条件tabs个数异常: ${tabs.length}`);
      return ;
    }
    proxyReset(tabs[0]);
  });
}