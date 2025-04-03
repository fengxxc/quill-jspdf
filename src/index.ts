import { jsPDF } from 'jspdf';
import Delta, { Op } from 'quill-delta';
import IAttributeMap from './IAttributeMap';
import IFont from './IFont';

class QuillJsPdf {
    constructor() {
        console.log('QuillJsPdf initialized');
    }

    generatePdf() {
        console.log('PDF generated');
    }

    static testFunction(a: number, b: number): number {
        return a + b;
    }

    static deltaToPdf(delta: Delta, fonts: IFont[]): jsPDF {
        // Convert Quill Delta to PDF format
        // initialize jsPDF
        const doc: jsPDF = new jsPDF({
            unit: 'px',
            //   orientation: "landscape",
            format: 'a4',
        }).setProperties({ title: 'This is title' }); // TODO

        var pageWidth = doc.internal.pageSize.getWidth() || 794,
            marginTop = 10.5,
            marginRight = 2.5,
            marginBottom = 2.5,
            marginLeft = 2.5,
            maxLineWidth = pageWidth - marginLeft - marginRight;

        fonts.forEach((font: IFont) => {
            doc.addFont(font.url, font.id, font.fontStyle, font.fontWeight, font.encoding);
        });
        console.log(doc.getFontList());
        let nextCoord = {x: marginLeft, y: marginTop};
        for (let i = 0; i < delta.ops.length; i++) {
            const op = delta.ops[i];
            nextCoord = QuillJsPdf.process(doc, op, nextCoord, maxLineWidth, marginLeft);
        }
        return doc;
    }

    static process(
        doc: jsPDF,
        op: Op,
        nextCoord: {x: number, y: number},
        maxLineWidth: number,
        xStart: number
    ): {x: number, y: number} {
        if (op.insert) {
            const text = op.insert;
            if (typeof text !== 'string') {
                return nextCoord; // TODO Skip non-string inserts
            }
            return QuillJsPdf.processInsert(
                doc,
                text,
                op.attributes || {},
                nextCoord,
                maxLineWidth,
                xStart
            );
        }
        if (op.delete) {
            return QuillJsPdf.processDelete(doc, op, nextCoord);
        }
        // TODO Handle other operations
        return nextCoord;
    }

    /**
     * 若 endWidthNewLine == true，则下一个的坐标定位在下一行，否则在本行末尾
     * @param doc 
     * @param text 
     * @param attributes 
     * @param coord 
     * @param maxLineWidth 
     * @param xStart 
     * @param endWidthNewLine 
     * @returns 下一个的坐标
     */
    static processInsert(
        doc: jsPDF,
        text: string,
        attributes: IAttributeMap,
        coord: {x: number, y: number},
        maxLineWidth: number,
        xStart: number,
        endWidthNewLine: boolean = false
    ): {x: number, y: number} {
        const bold = attributes.bold || false;
        const italic = attributes.italic || false;
        const underline = attributes.underline || false;
        const strike = attributes.strike || false;
        const color = attributes.color || 'black';
        const background = attributes.background || 'transparent';
        const size =
            typeof attributes.size == 'number'
                ? attributes.size
                : parseInt(attributes.size || '12');
        const font = attributes.font || 'Helvetica';
        // let fontStyle: string = (!bold && !italic) ? "normal" : "";
        let fontStyle: string = "";
        if (bold) {
            fontStyle += "bold";
        }
        if (italic) {
            fontStyle += "italic";
        }
        var textLines: string[] = doc
            .setFont(font, fontStyle)
            .setFontSize(size)
            .setTextColor(color)
            .splitTextToSize(text, maxLineWidth);
        console.log(textLines, fontStyle)
        if (textLines.length > 1 && coord.x != xStart) {
            /**
             * 如果是多行并且是接上一个的结尾，则按第一个末尾的"\n"分割，分两批，第一批接上一个，第二批另起一行
             * 例如
             * aaaaaaaa
             * aaaabbbb
             * bbbbbbbb
             * a... 是上一个，b... 是本个
             */
            const firstLine = textLines[0];
            const firstCoord = this.processInsert(doc, firstLine, attributes, coord, maxLineWidth, xStart, true);
            return this.processInsert(doc, text.replace(firstLine + '\n', ''), attributes, firstCoord, maxLineWidth, xStart, false);
        }
        doc.text(textLines, coord.x, coord.y, { baseline: "alphabetic"/* , align: "center" */});
        // doc.rect(coord.x, coord.y, 1, 1,); // Debug: view baseline point
        return this.computeNextXY(doc, coord.x, coord.y, xStart, textLines, endWidthNewLine, font, size);
    }

    static processDelete(_doc: jsPDF, _op: Op, coord: {x: number, y: number}): {x: number, y: number} {
        // Process each item in the Quill Delta
        // TODO
        return coord;
    }

    static computeNextXY(doc: jsPDF, x: number, y: number, xStart: number, textLines: string[], endWidthNewLine: boolean, font: string, fontSize: number): {x: number, y: number} {
        let _x = x;
        let _y = y;
        for (let i = 0; i < textLines.length; i++) {
            const textLine = textLines[i];
            const { w, /* h */ } = doc.getTextDimensions(textLine, {/* font: font, */ fontSize: fontSize/* , maxWidth: maxLineWidth */, scaleFactor: doc.internal.scaleFactor});
           
            if(i == textLines.length - 1) {
                _x += w;
                if (endWidthNewLine) {
                    _x = xStart;
                    _y += doc.getLineHeight() / doc.internal.scaleFactor
                }
            } else {
                // _y += h;
                _y += doc.getLineHeight() / doc.internal.scaleFactor
            }
        }
        return {x: _x, y: _y};
    }
}

export default QuillJsPdf;
