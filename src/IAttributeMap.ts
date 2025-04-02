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

    // align?: string;
    // lineHeight?: number;
    // margin?: number;
    // indent?: number;
}