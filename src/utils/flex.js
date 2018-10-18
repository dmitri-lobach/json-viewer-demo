
export const align = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  space: {
    between: 'space-between',
    around: 'space-around'
  },
  stretch: 'stretch',
  baseline: 'baseline'
}


export function singleLine(isColumn,primary,secondary,reverse=false) {
  return {
    display: 'flex',
    flexFlow: isColumn
      ? (reverse ? 'column-reverse nowrap' : 'column nowrap')
      : (reverse ? 'row-reverse nowrap' : 'row nowrap'),
    justifyContent: primary,
    alignItems: secondary

  }
}

export function row(primary,secondary) {
  return singleLine(false,primary,secondary);
}

export function column(primary,secondary) {
  return singleLine(true,primary,secondary);
}

export function rowReverse(primary,secondary) {
  return singleLine(false,primary,secondary,true);
}

export function columnReverse(primary,secondary) {
  return singleLine(true,primary,secondary,true);
}

export function multiLine(isColumn,primary,secondary,secondaryContent,reverseItems,reverseLines=false) {
  return {
    display: 'flex',
    flexFlow: isColumn
      ? (reverseItems
        ? (reverseLines ? 'column-reverse wrap-reverse' : 'column-reverse wrap')
        : (reverseLines ? 'column wrap-reverse' : 'column wrap'))
      : (reverseItems
        ? (reverseLines ? 'row-reverse wrap-reverse' : 'row-reverse wrap-reverse')
        : (reverseLines ? 'row wrap-reverse' : 'row wrap')),
    justifyContent: primary,
    alignContent: secondary,
    alignItems: secondaryContent
  }
}

export function multiRow(primary,secondary,secondaryContent,reverseLines) {
  return multiLine(false,primary,secondary,secondaryContent,false,reverseLines);
}

export function multiColumn(primary,secondary,secondaryContent,reverseLines) {
  return multiLine(true,primary,secondary,secondaryContent,false,reverseLines);
}

export function multiRowReverse(primary,secondary,secondaryContent,reverseLines) {
  return multiLine(false,primary,secondary,secondaryContent,true,reverseLines);
}

export function multiColumnReverse(primary,secondary,secondaryContent,reverseLines) {
  return multiLine(true,primary,secondary,secondaryContent,true,reverseLines);
}

export function alignSelf(itemAlign) {
  return {
    alignSelf:itemAlign
  }
}

export function size(grow = 1, shrink = 0, basis = null) {
  basis = (typeof basis === 'number') ? basis + 'px' : basis;
  return {
    flexGrow: grow,
    flexShrink: shrink,
    flexBasis: basis
  }
}

export const constSize = basis => size(0,0,basis);

export const basis = {
  auto: 'auto',
  fill: 'fill',
  content: 'content',
  maxContent: 'max-content',
  minContent: 'min-content',
  fitContent: 'fit-content'
}

export const center = row(align.center, align.center);

export const leftCenter = row(align.start, align.center);

export const rightCenter = row(align.end, align.center);

export const centerTop = column(align.start, align.center);

export const centerBottom = column(align.end, align.center);

export const inline = (flexDesc) => ({...flexDesc, display: 'inline-flex'});

export default {
  singleLine, multiLine, alignSelf, size, constSize, align, center, leftCenter, rightCenter, centerTop, centerBottom, basis,
  row, column, rowReverse, columnReverse, multiRow, multiColumn, multiRowReverse, multiColumnReverse, inline}
