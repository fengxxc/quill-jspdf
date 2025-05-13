import { Op } from 'quill-delta';
import ParagraphProvider from './ParagraphProvider';
import { ErrCode } from './AlignAndLiProvider';
import jsPDF from 'jspdf';
import IAttributeMap from './IAttributeMap';

export default class PageParagraphProvider extends ParagraphProvider {
    private _doc: jsPDF;
    private _width: number = 0;

    public constructor(doc: jsPDF, width: number) {
        super();
        this._doc = doc;
        this._width = width;
    }

    public setFontAbout(font: string, fontStyle: string, size: number) {
        this._doc.setFont(font, fontStyle).setFontSize(size);
    }

    public accept(op: Op): ErrCode {
        return super.accept(op);
    }

    public consume(): Op[] {
        let lastBrIdx = -1;
        let lineWidth = 0;
        const pSplits: Op[] = super.consume();
        for (let i = 0; i < pSplits.length; i++) {
            const op = pSplits[i];
            const insert = op.insert as string;
            const attributes: IAttributeMap = op.attributes || {};
            const bold = attributes.bold || false;
            const italic = attributes.italic || false;
            const size =
                typeof attributes.size == 'number'
                    ? attributes.size
                    : parseInt(attributes.size || '12');
            const font = attributes.font || 'Helvetica';
            // let fontStyle: string = (!bold && !italic) ? "normal" : "";
            let fontStyle: string = '';
            if (bold) {
                fontStyle += 'bold';
            }
            if (italic) {
                fontStyle += 'italic';
            }
            const endWithBr: boolean = insert.endsWith('\n');
            const text = endWithBr ? insert.slice(0, -1) : insert;
            const textIndent = PageParagraphProvider.getLastWidth(pSplits, lastBrIdx + 1, i);
            const textLines: string[] = this._doc
                .setFont(font, fontStyle)
                .setFontSize(size)
                .splitTextToSize(text, this._width, { textIndent: textIndent });
            // append to pSplits
            if (textLines.length > 1) {
                const newSplits: Op[] = this.splitOp(op, textLines, size, endWithBr);
                pSplits.splice(i, 1, ...newSplits);
                i += newSplits.length - 1;
                if (!endWithBr) {
                    const lastOp = newSplits[newSplits.length - 1];
                    lastBrIdx = i - 1;
                    lineWidth = lastOp.attributes!._w as number || 0;
                } else {
                    lastBrIdx = i;
                    lineWidth = 0;
                }
            } else {
                const {w, } = this._doc.getTextDimensions(insert, {fontSize: size, scaleFactor: this._doc.internal.scaleFactor});
                if (op.attributes === undefined) {
                    op.attributes = {};
                }
                op.attributes["_w"] = w;
                lineWidth += w;
            }
        }
        // 把前面的换行之后的全都 set lineWidth 
        for (let i = lastBrIdx + 1; i < pSplits.length; i++) {
            const op = pSplits[i];
            if (op.attributes === undefined) {
                op.attributes = {};
            }
            op.attributes["_lw"] = lineWidth;
        }
        return pSplits;
    }

    private splitOp(op: Op, textLines: string[], size: number, endWithBr: boolean): Op[] {
        const newOps: Op[] = [];
        for (let i = 0; i < textLines.length; i++) {
            let line: string = textLines[i];
            const isBrLine: boolean = i < textLines.length - 1 || (endWithBr && i == textLines.length - 1);
            if (isBrLine) {
                line += "\n";
            }
            const {w, } = this._doc.getTextDimensions(line, {fontSize: size, scaleFactor: this._doc.internal.scaleFactor});
            const newAttr: IAttributeMap = { ...op.attributes, "_w": w };
            if ("start_align" in newAttr && i > 0) {
                delete newAttr["start_align"];
            }
            if (isBrLine) {
                newAttr["_lw"] = w;
            }
            const newOp: Op = {
                insert: line,
                attributes: newAttr
            };
            newOps.push(newOp);
        }
        return newOps;
    }
    static getLastWidth(pSplits: Op[], startIdx: number, endIdx: number): number {
        let w = 0;
        for (let i = startIdx; i < endIdx; i++) {
            const op = pSplits[i];
            if (op.attributes === undefined || !("_w" in op.attributes)) {
                break;
            }
            if ((op.insert as string).endsWith('\n')) {
                break;
            }
            const _w: number = (op.attributes as IAttributeMap)._w || 0;
            w += _w;
        }
        return w;
    }
}

