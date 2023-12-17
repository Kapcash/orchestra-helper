/* eslint-disable no-console */
import isHtml from 'is-html'
import './custom-style.css'
import type { Ranges } from 'htmljs-parser';
import { validateHTML } from './html-validator';

console.info('[orchestra-helper] Setting helpers on the editor page');

(() => {
  /* ===== Setup UI ===== */
  const allTextInputs = document.querySelectorAll<HTMLInputElement>('.zone-content > input.edito-long')

  Array.from(allTextInputs).forEach(input => input.addEventListener('blur', onBlurCheckHTML))
  /* ==================== */
})()

function onBlurCheckHTML(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  const value = input?.value

  if (isHtml(value)) {
    try {
      validateHTML(input)
    }
    catch (error: any) {
      if (((error): error is Ranges.Error => (error.start || error.end) && error.message)(error)) {
        highlightError(input, error.message, error.start, error.end)
      }
    }
  }
}

function highlightError(input: HTMLInputElement, errorMessage: string, column: number, columnEnd: number) {
  input.classList.add('error-html')
  input.scrollIntoView({ block: 'center' })
  input.setCustomValidity(errorMessage)
  input.reportValidity()
  if (!isNaN(column)) {
    input.setSelectionRange(column, columnEnd || (column + 1))
  }
}
