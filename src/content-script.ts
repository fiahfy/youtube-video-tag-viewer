import { browser } from 'webextension-polyfill-ts'

const ClassName = {
  container: 'yvtv-tags-container',
  noTags: 'yvtv-no-tags',
}

const isVideoUrl = () => new URL(location.href).pathname === '/watch'

const querySelectorAsync = (
  selector: string,
  interval = 100,
  timeout = 1000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = setInterval(() => {
      const e = document.querySelector(selector)
      if (e || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(e)
      }
    }, interval)
  })
}

const getTags = async () => {
  const res = await fetch(location.href)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/html')
  return Array.from(doc.querySelectorAll('meta[property="og:video:tag"]')).map(
    (meta) => (meta as HTMLMetaElement).content
  )
}

const createLabel = (tag: string) => {
  const span = document.createElement('div')
  span.classList.add('style-scope', 'ytd-badge-supported-renderer')
  span.textContent = tag

  const div = document.createElement('div')
  div.classList.add(
    'badge',
    'badge-style-type-simple',
    'style-scope',
    'ytd-badge-supported-renderer'
  )
  div.onclick = () => {
    location.href = `/results?search_query=${tag}`
  }
  div.append(span)

  return div
}

const renderTags = async () => {
  const oldContainer = document.querySelector(`.${ClassName.container}`)
  oldContainer && oldContainer.remove()

  const info = await querySelectorAsync(
    'ytd-video-primary-info-renderer > #container > #info'
  )
  if (!info) {
    return
  }

  const container = document.createElement('div')
  container.classList.add(ClassName.container)

  const tags = await getTags()

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

const setup = async () => {
  if (!isVideoUrl()) {
    return
  }

  await renderTags()
}

browser.runtime.onMessage.addListener(async (message) => {
  const { id } = message
  switch (id) {
    case 'urlChanged':
      return await setup()
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  await setup()
})
