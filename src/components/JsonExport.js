import {div, el} from "../utils/react";
import {stylers} from "./stylers";
import {Scrollbars} from "react-custom-scrollbars";

export const JsonExport = ({json}) =>
  el(Scrollbars, {},
    div({style: stylers.jsonExport()}, json));