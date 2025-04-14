import { Op } from 'quill-delta';
import ParagraphProvider from './ParagraphProvider';
import { ErrCode } from './AlignProvider';
import jsPDF from 'jspdf';
import IAttributeMap from './IAttributeMap';

/* interface ParagraphLine {
    ops: Op[];
    width: number;
} */

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
            const endWithBr = insert.endsWith('\n');
            const text = endWithBr ? insert.slice(0, -1) : insert;
            const textLines: string[] = this._doc
                .setFont(font, fontStyle)
                .setFontSize(size)
                .splitTextToSize(text, this._width);
            // append to pSplits
            if (textLines.length > 1) {
                const newSplits: Op[] = this.splitOp(op, textLines, size);
                pSplits.splice(i, 1, ...newSplits);
                i += newSplits.length - 1;
            } else {
                const {w, } = this._doc.getTextDimensions(insert, {fontSize: size, scaleFactor: this._doc.internal.scaleFactor});
                if (op.attributes === undefined) {
                    op.attributes = {};
                }
                op.attributes["_w"] = w;
                // op.attributes["_h"] = h;
            }
        }
        return pSplits;
    }

    private splitOp(op: Op, textLines: string[], size: number): Op[] {
        const newOps: Op[] = [];
        for (let i = 0; i < textLines.length; i++) {
            const line: string = textLines[i] += "\n";
            const {w, } = this._doc.getTextDimensions(line, {fontSize: size, scaleFactor: this._doc.internal.scaleFactor});
            const newOp: Op = {
                insert: line,
                attributes: { ...op.attributes, "_w": w }
            };
            newOps.push(newOp);
        }
        return newOps;
    }
}
