import { AttributeMap } from "quill-delta";

export default interface IAttributeMap extends AttributeMap {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    background?: string;
    size?: number | string;
    font?: string;
    list?: "bullet" | "ordered" | "check";

    start_align?: string; // start align, for example: "left", "center", "right"
    align?: string; // align, for example: "left", "center", "right"
    _w?: number; // width of the text in the current line
    _lw?: number; // width of the full text in the current line

    // align?: string;
    // lineHeight?: number;
    // margin?: number;
    // indent?: number;
}