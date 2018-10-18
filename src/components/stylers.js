import {isSome} from "../utils/tools";
import flex from "../utils/flex";
import {span} from "../utils/react";

const fontFamily = "Roboto, sans-serif"

const interfaceFont = (fontSize, lineHeight) =>
  ({fontFamily, fontSize, lineHeight: isSome(lineHeight) ? lineHeight : Math.round(fontSize * 16 / 14)+"px"});

const box = (w, h) => ({width: w, height: isSome(h) ? h : w});

export const idealsGreen = "#00a55c";

const basicTextColor = "#505050";
const lightTextColor = "#808080";

export const styles = {
  font: {
    basic: {...interfaceFont(14, "18px")},
    bold: {...interfaceFont(16, "18px"), fontWeight: "bold"},
    smallBold: {...interfaceFont(11, "8px"), fontWeight: "bold"},
  },
  rowHeight: 28,
  levelIndent: 20,
  syntaxPad: 4,
  textBlock: {width: 400, maxHeight: 200},
  color: {
    basic: basicTextColor,
    counter: {back: "#6591b4", content: "white"},
    search: idealsGreen,
    expansion: lightTextColor,
    selection: idealsGreen,
    json: {
      syntax: lightTextColor,
      key: "#8c6e9c",
      string: "#5c7450",
      boolean: "#cc7832",
      null: "#cc7832",
      number: "#6591b4"
    },
    error: {
      back: "#fff0f0",
      message: "#dd2222",
      excerpt: "#5c7450"
    }
  }
};

const thinBorder = {borderStyle: "solid", borderWidth: 1, borderColor: "lightgrey"};

export const stylers = {
  jsonViz: {
    item: () => ({...flex.inline(flex.leftCenter)}),
    kvPair: () => ({...flex.inline(flex.leftCenter)}),
    counter: {
      inner: () => ({paddingLeft: 4, paddingRight: 4}),
      outer: () => ({
        borderRadius: 8, height: 16, minWidth: 16,
        backgroundColor: styles.color.counter.back,
        color: styles.color.counter.content,
        ...flex.center, ...styles.font.smallBold,
        marginRight: 2})
    },
    bracket: () => ({color: styles.color.json.syntax, ...styles.font.bold, paddingLeft: 1, paddingRight: 1}),
    key: () => ({color: styles.color.json.key, ...styles.font.basic, fontStyle: "italic"}),
    colon: () => ({color: styles.color.json.syntax, ...styles.font.basic, paddingLeft: 1, paddingRight: styles.syntaxPad}),
    comma: () => ({color: styles.color.json.syntax, ...styles.font.basic, paddingRight: styles.syntaxPad}),
    spread: () => ({color: styles.color.json.syntax, ...styles.font.basic}),
    types: {
      number: () => ({color: styles.color.json.number, ...styles.font.basic}),
      string: () => ({color: styles.color.json.string, ...styles.font.basic}),
      boolean: () => ({color: styles.color.json.boolean, ...styles.font.bold}),
      null: () => ({color: styles.color.json.null, ...styles.font.bold})
    },
    textBlock: () => ({
      width: styles.textBlock.width, marginTop: 4, marginBottom: 4,
      minHeight: styles.rowHeight, maxHeight: styles.textBlock.maxHeight
    })
  },
  tree: {
    node: {
      group: () => ({width: "100%", ...flex.column(flex.align.start, flex.align.stretch)}),
      item: () => ({width: "100%", minHeight: styles.rowHeight, ...flex.row(flex.align.start, flex.align.center), color: styles.color.basic}),
      indent: ({level}) => ({width: level * styles.levelIndent, ...flex.constSize(level * styles.levelIndent)}),
      expansionToggle: ({expanded}) => ({
        ...box(24), ...flex.constSize(24), ...flex.center,
        cursor: "pointer", transform: `rotate(${expanded ? 90 : 0}deg)`, marginLeft: -8
      }),
      selectionToggle: () => ({
        ...box(styles.rowHeight), ...flex.constSize(styles.rowHeight),
        ...flex.center, cursor: "pointer",
        color: styles.color.selection
      }),
      value: () => ({...flex.row(flex.align.start, flex.align.center)}),
    },
    root: () => ({...box("100%"), cursor: "default", userSelect: "none"}),
    scrollWrapper: () => ({})
  },
  jsonExport: () => ({width: "100%", height: "100%", whiteSpace: "pre", color: styles.color.basic, ...styles.font.basic}),
  dropOverlay: () => ({
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    background: 'rgba(0,0,0,0.5)',
    color: "white", ...styles.font.bold,
    ...flex.center,
  }),
  noContent: () => ({
    ...box("100%"), paddingTop: "30%",
    ...flex.centerTop,
    color: styles.color.basic, ...styles.font.bold,
    ...thinBorder
  }),
  error: {
    root: () => ({
      minHeight: 36, ...flex.column(flex.align.start, flex.align.start),
      backgroundColor: styles.color.error.back, color: "white", margin: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4,
      borderStyle: "solid", borderWidth: 1, borderColor: styles.color.error.message, borderRadius: 2,
      whiteSpace: "pre-wrap",
    }),
    message: () => ({
      ...interfaceFont(12, "14px"),
      color: styles.color.error.message,
      padding: 4,
    }),
    highlight: () => ({
      ...flex.inline(flex.leftCenter), ...styles.font.basic,
      paddingBottom: 4,
      color: styles.color.error.excerpt
    }),
    symbol: () => ({
      backgroundColor: styles.color.error.message, ...styles.font.basic, lineHeight: "14px", color: "white",
      padding: 2, borderRadius: 2
    })
  },
  main: {
    root: () => ({...box("100%"), ...flex.row(flex.align.start, flex.align.start), padding: 4}),
    treePanel: () => ({...box("50%", "100%"), ...flex.column(flex.align.start, flex.align.stretch), ...thinBorder, padding: 4, marginRight: 4}),
    jsonPanel: () => ({height: "100%", ...flex.size(1, 1, 0), ...thinBorder, padding: 4})
  }
}

export const  Icon = ({name, size, style, ...restProps}) => {
  size = size || 24;
  style = {...style, fontSize: size};
  const className = "material-icons";
  return span({style, className, ...restProps}, name);
}