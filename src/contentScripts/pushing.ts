/* eslint-disable no-console */
import './custom-style.css'

const campaignIdContainerSelector = '#mainzone_0 td.main-zone-content'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
console.info('[orchestra-helper] Setting helpers UI on the pushings page');

/* ===== Setup UI ===== */
(() => {
  const rightActions = document.querySelector('#hotelPushingForm > div.buttons > div.right')
  if (!rightActions) {
    throw new Error('Right actions container not found')
  }

  const unpublishButton = document.createElement('button')
  unpublishButton.id = 'orchestra-helper_unpublish-button'
  unpublishButton.className = 'action-btn'
  unpublishButton.textContent = 'Dépublier'
  unpublishButton.disabled = false
  unpublishButton.title = 'Retire un an sur les dates, et utilise la campagne correcte.'
  unpublishButton.type = 'button'
  unpublishButton.addEventListener('click', unpublish)

  rightActions.prepend(unpublishButton)

  const styleEl = document.createElement('link')
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  document.head.appendChild(styleEl)

  /* ==================== */

  const initialCampaignId = getCampaignId()

  if (!isEndDateInFuture()) {
    unpublishButton.disabled = true
    unpublishButton.title = 'Impossible de dépublier un pushing déjà expiré.'
  }

  function unpublish() {
    function reduceByOneYear(dateInput: HTMLInputElement) {
      const [year, month, day] = dateInput.value.split('/').reverse()
      dateInput.value = `${day}/${month}/${parseInt(year, 10) - 1}`
    }

    const startDateStr = document.getElementsByName('pushingValidityStart')[0] as HTMLInputElement
    const endDateStr = document.getElementsByName('pushingValidityEnd')[0] as HTMLInputElement
    reduceByOneYear(startDateStr)
    reduceByOneYear(endDateStr)

    if (getCampaignId() !== initialCampaignId) {
      setCampaignIdWarning('Attention ! La campagne a été modifiée. Pour dépublier correctement le pushing, nous allons automatiquement remettre la campagne originale.')
    }

    setCampaignId(initialCampaignId)

    // Auto submit form
    // const validateButton = document.getElementById('ipt_popupHotelPushingValidate')
    // validateButton?.click()
  }
})()

function isEndDateInFuture(): boolean {
  const endDateStr = document.getElementById('pushingValidityEnd') as HTMLInputElement
  const [year, month, day] = endDateStr.value.split('/').reverse()
  const hour = document.getElementById('slt_pushingValidityEndHour') as HTMLSelectElement
  const minute = document.getElementById('slt_pushingValidityEndMinute') as HTMLSelectElement
  const endDate = new Date(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), parseInt(hour.value, 10), parseInt(minute.value, 10))
  return endDate.getTime() > Date.now()
}

function getCampaignId(): string {
  const campaingId = (document.querySelector(`${campaignIdContainerSelector} > input`) as HTMLInputElement)?.value
  if (!campaingId) {
    throw new Error('CampaignId not found!')
  }
  return campaingId
}

function setCampaignId(campaingId: string) {
  const campaingIdInput = (document.querySelector(`${campaignIdContainerSelector} > input`) as HTMLInputElement)
  if (!campaingId) {
    throw new Error('CampaignId not found!')
  }
  campaingIdInput.value = campaingId
}

function setCampaignIdWarning(message: string) {
  const campaingIdContainer = document.querySelector(campaignIdContainerSelector)
  const warningSpan = document.createElement('span')
  warningSpan.style.color = 'orange'
  warningSpan.textContent = message
  campaingIdContainer?.appendChild(warningSpan)
}
