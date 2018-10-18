import {stylers} from "./stylers";
import {div, el} from "../utils/react";
import {isSome} from "../utils/tools";

export const ErrorDisplay = ({error}) => {
  let highlight = null;
  if (isSome(error.excerpt)) {
    const excerpt = error.excerpt;
    const offset = error.excerptProblemOffset;
    if (offset < excerpt.length) {
      highlight = div({style: stylers.error.highlight()}, [
        excerpt.substr(0, offset),
        el("b", {style: stylers.error.symbol()}, excerpt.substr(offset, 1)),
        excerpt.substr(offset+1)
      ])
    } else
      highlight = div({style: stylers.error.highlight()}, excerpt);
  }
  return div({style: stylers.error.root()}, [
    div({style: stylers.error.message()}, error.message),
    highlight
  ])
}