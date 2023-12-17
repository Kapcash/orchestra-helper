import type { Ranges } from 'htmljs-parser';
import { TagType, createParser } from 'htmljs-parser';

const htmlWrapperElement = 'div'
const openWrapper = `<${htmlWrapperElement}>`
const closeWrapper = `</${htmlWrapperElement}>`

/** Overrides default parse error message */
const errorPatterns: [string, (range: Ranges.Error, matchError: RegExpMatchArray | null, inputString: string) => void][] = [
  [`The closing "${htmlWrapperElement}" tag does not match the corresponding opening "(.+)" tag`, (range, matchingError, inputString) => {
    const openingTagNotClosed = matchingError?.[1]
    if (openingTagNotClosed) {
      range.message = `The tag "${openingTagNotClosed}" is opened but never closed!`
      const fullHtmlTag = `<${openingTagNotClosed}>`
      range.start = inputString.indexOf(fullHtmlTag)
      range.end = range.start + fullHtmlTag.length
    }
  }],

  [`The closing "(.+)" tag does not match the corresponding opening "${htmlWrapperElement}" tag`, (range, matchingError, inputString) => {
    const closingTagNotOpened = matchingError?.[1]
    if (closingTagNotOpened) {
      range.message = `The tag "${closingTagNotOpened}" is closed but never opened!`
      const fullHtmlTag = `</${closingTagNotOpened}>`
      range.start = inputString.indexOf(fullHtmlTag)
      range.end = range.start + fullHtmlTag.length
    }
  }],
]

/**
 * Parses the input value as HTML
 * @throws Ranges.error if the html is not valid.
 */
export function validateHTML(input: HTMLInputElement) {
  const htmlAsString = input.value;

  const parser = createParser({
    onError(range) {
      console.error('ERROR IN HTML FOUND', range.message, input);

      for (const [pattern, setRange] of errorPatterns) {
        const match = new RegExp(pattern).exec(range.message)
        if (match) {
          setRange(range, match, htmlAsString)
          throw range
        }
      }

      range.start -= openWrapper.length
      range.end -= closeWrapper.length

      throw range
    },
    onOpenTagName(range) {
      switch (parser.read(range)) {
        case 'area':
        case 'base':
        case 'br':
        case 'col':
        case 'embed':
        case 'hr':
        case 'img':
        case 'input':
        case 'link':
        case 'meta':
        case 'param':
        case 'source':
        case 'track':
        case 'wbr':
          // TagType.void makes this a void element (cannot have children).
          return TagType.void;
        case 'html-comment':
        case 'script':
        case 'style':
        case 'textarea':
          // TagType.text makes the child content text only (with placeholders).
          return TagType.text;
        case 'class':
        case 'export':
        case 'import':
        case 'static':
          // TagType.statement makes this a statement tag where the content following the tag name will be parsed as script code until we reach a new line, eg for `import x from "y"`).
          return TagType.statement;
        default:
          // TagType.html is the default which allows child content as html with placeholders.
          return TagType.html;
      }
    },
  })

  parser.parse(`${openWrapper}${htmlAsString}${closeWrapper}`)
}
