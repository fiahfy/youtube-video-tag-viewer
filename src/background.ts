chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    await chrome.tabs.sendMessage(tabId, { type: 'url-changed' })
  }
})
