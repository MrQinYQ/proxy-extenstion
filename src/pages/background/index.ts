
chrome.runtime.onInstalled.addListener(function() {
  console.log('proxy extenstion installed');
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    proxyReset(tab)
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    proxyReset(tab)
  }
})

function proxyReset (tab: chrome.tabs.Tab) {
  if (tab.url === undefined) {
    console.error('url is empty');
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
  const pacHttpsList: string[] = [];
  proxys.filter((item) => item.enable).filter((item) => {
    const reg = new RegExp(item.reg)
    if (reg.test(tab.url!)) {
      return true;
    } else {
      return false;
    }
  }).forEach((item) => {
    const proxyList = item.hosts.filter(host => host.enable && host.domain && host.ip);
    pacHttpList.push(...proxyList.map((litem) => {
      return `if (host === "${litem.domain}" || shExpMatch(host, "${litem.domain}")) {
        return "PROXY ${litem.ip}:80"
      }`
    }));
    pacHttpsList.push(...proxyList.map((litem) => {
      return `if (host === "${litem.domain}" || shExpMatch(host, "${litem.domain}")) {
        return "PROXY ${litem.ip}:443"
      }`
    }));
  })
  const pacScript = `
  function FindProxyForURL(url,host){
    if(shExpMatch(url, "http:*")){
      ${pacHttpList.join('\n')}
    } else if (shExpMatch(url, "https:*")) {
      ${pacHttpsList.join('\n')}
    } else {
      return "DIRECT";
    }
  }
  `;
  if (pacHttpList.length > 0 || pacHttpsList.length > 0) {
    chrome.proxy.settings.set({scope: 'regular', value:  {mode: 'pac_script', pacScript: {data: pacScript}}});
  } else {
    chrome.proxy.settings.set({scope: 'regular', value: {mode: 'system'}});
  }
}

function proxyClear () {
  chrome.proxy.settings.clear({}, () => {
    console.log('clear proxy');
  })
}

function proxySubmit () {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length > 1 || tabs.length === 0) {
      console.error(`符合条件tabs个数异常: ${tabs.length}`);
      return ;
    }
    proxyReset(tabs[0]);
  });
}