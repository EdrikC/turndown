import { isBlock, isVoid, hasVoid, isMeaningfulWhenBlank, hasMeaningfulWhenBlank } from './utilities'

export default function Node (node, options) {
  node.isBlock = isBlock(node)
  node.isCode = node.nodeName === 'CODE' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node, options)
  return node
}

function isBlank (node) {
  if (hasBr(node)) {
    return false;
  }
  return (
    !isVoid(node) &&
    !isMeaningfulWhenBlank(node) &&
    /^\s*$/i.test(node.textContent) &&
    !hasVoid(node) &&
    !hasMeaningfulWhenBlank(node)
  )
}

// Helper function to check if node contains <br> elements
function hasBr(node) {
  return node.querySelector && node.querySelector('br') !== null;
}

function flankingWhitespace (node, options) {
  if (node.isBlock || (options.preformattedCode && node.isCode)) {
    return { leading: '', trailing: '' }
  }

  var edges = edgeWhitespace(node.textContent)

  // // abandon leading ASCII WS if left-flanked by ASCII WS
  // if (edges.leadingAscii && isFlankedByWhitespace('left', node, options)) {
  //   edges.leading = edges.leadingNonAscii
  // }

  // // abandon trailing ASCII WS if right-flanked by ASCII WS
  // if (edges.trailingAscii && isFlankedByWhitespace('right', node, options)) {
  //   edges.trailing = edges.trailingNonAscii
  // }

  return { leading: edges.leading, trailing: edges.trailing }
}

function edgeWhitespace (string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/)
  return {
    leading: m[1], // whole string for whitespace-only strings
    leadingAscii: '',
    leadingNonAscii: '',
    trailing: m[4], // empty for whitespace-only strings
    trailingNonAscii: '',
    trailingAscii: ''
  }
}

function isFlankedByWhitespace (side, node, options) {
  var sibling
  var regExp
  var isFlanked

  if (side === 'left') {
    sibling = node.previousSibling
    regExp = / $/
  } else {
    sibling = node.nextSibling
    regExp = /^ /
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue)
    } else if (options.preformattedCode && sibling.nodeName === 'CODE') {
      isFlanked = false
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}
