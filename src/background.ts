import { browser } from 'webextension-polyfill-ts'
import inject from '~/assets/inject.css'

const contentLoaded = async (tabId: number) => {
  await browser.tabs.insertCSS(tabId, { file: inject })
  await browser.pageAction.show(tabId)
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    browser.tabs.sendMessage(tabId, { id: 'urlChanged' })
  }
})

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { id } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      return tab?.id && (await contentLoaded(tab.id))
  }
})
