import { semaphore } from '@fiahfy/semaphore'

const ClassName = {
  container: 'yvtv-tags-container',
  noTags: 'yvtv-no-tags',
}

const s = semaphore()
const isVideoUrl = () => new URL(location.href).pathname === '/watch'

const querySelectorAsync = (
  selector: string,
  interval = 100,
  timeout = 10000
) => {
  return new Promise<Element | null>((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = window.setInterval(() => {
      const e = document.querySelector(selector)
      if (e || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(e)
      }
    }, interval)
  })
}

const fetchTags = async () => {
  const res = await fetch(location.href)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/html')
  return Array.from(doc.querySelectorAll('meta[property="og:video:tag"]')).map(
    (meta) => (meta as HTMLMetaElement).content
  )
}

const createLabel = (tag: string) => {
  const encoded = encodeURIComponent(tag)
  const a = document.createElement('a')
  a.classList.add(
    'badge',
    'badge-style-type-simple',
    'ytd-badge-supported-renderer'
  )
  a.href = `/results?search_query=${encoded}`
  a.textContent = tag
  return a
}

const renderTags = async () => {
  document
    .querySelectorAll(`.${ClassName.container}`)
    .forEach((e) => e.remove())

  const info = await querySelectorAsync('#above-the-fold > #top-row')
  if (!info) {
    return
  }

  const container = document.createElement('div')
  container.classList.add(ClassName.container)

  const tags = await fetchTags()

  if (tags.length) {
    for (const tag of tags) {
      container.append(createLabel(tag))
    }
  } else {
    container.classList.add(ClassName.noTags)
    const div = document.createElement('div')
    div.textContent = 'This video has no tags.'
    container.append(div)
  }

  info.parentElement?.insertBefore(container, info)
}

const init = async () => {
  if (!isVideoUrl()) {
    return
  }
  await s.acquire(async () => {
    await renderTags()
  })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  await init()
})
