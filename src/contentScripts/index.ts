/* eslint-disable no-console */
// import { onMessage } from 'webext-bridge/content-script'
import './custom-style.css'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[orchestra-helper] Hello world from content script')

  // // communication example: send previous tab title from background page
  // onMessage('tab-prev', ({ data }) => {
  //   console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  // })

  const actions = document.querySelector('#main > div.line > div.actions')
  if (!actions)
    return

  const br = document.createElement('br')
  const unpublishButton = document.createElement('button')
  unpublishButton.id = 'orchestra-helper_unpublish-button'
  unpublishButton.className = 'action-btn'
  unpublishButton.textContent = 'Dépublier'
  unpublishButton.addEventListener('click', unpublish)

  actions.appendChild(br)
  actions.appendChild(unpublishButton)

  const styleEl = document.createElement('link')
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  document.head.appendChild(styleEl)
})()

function unpublish() {
  console.log('Unpublish pushing')
}
