import { DocumentProperties, jsPDF, jsPDFOptions } from 'jspdf';
import Delta, { Op } from 'quill-delta';
import IAttributeMap from './IAttributeMap';
import IFont from './IFont';
import PageParagraphProvider from './PageParagraphProvider';

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

    static deltaToPdf(delta: Delta, jsPdfOptions: jsPDFOptions, docProp: DocumentProperties, fonts: IFont[]): jsPDF {
        // Convert Quill Delta to PDF format
        // initialize jsPDF
        const doc: jsPDF = new jsPDF(jsPdfOptions).setProperties(docProp);

        var pageWidth = doc.internal.pageSize.getWidth() || 794,
            marginTop = 10.5,
            marginRight = 2.5,
            // marginBottom = 2.5,
            marginLeft = 2.5,
            maxLineWidth = pageWidth - marginLeft - marginRight;

        fonts.forEach((font: IFont) => {
            doc.addFont(font.url, font.id, font.fontStyle, font.fontWeight, font.encoding);
        });
        let nextCoord = {x: marginLeft, y: marginTop};
        const provider = new PageParagraphProvider(doc, maxLineWidth);

        // TODO multithreading in future
        for (let i = 0; i < delta.ops.length; i++) {
            const op = delta.ops[i];
            if (typeof op.insert !== 'string') {
                continue; // TODO Skip non-string inserts
            }
            provider.accept(op);
        }
        provider.setFinished();
        let align: "left" | "center" | "right" | "justify" | undefined = undefined;
        while (!provider.isFinished()) {
            const ops: Op[] = provider.consume();
            for (let i = 0; i < ops.length; i++) {
                const op = ops[i];
                const attr: IAttributeMap = op.attributes || {};

                let xStart = marginLeft;
                if (op.attributes && "start_align" in op.attributes) {
                    align = op.attributes.start_align as "left" | "center" | "right" | "justify" | undefined;
                    const lw = attr._lw || 0;
                    if (align == "center") {
                        nextCoord.x += (maxLineWidth - lw) / 2;
                    } else if (align == "right") {
                        nextCoord.x += maxLineWidth - lw;
                    }
                    xStart = nextCoord.x;
                }

                nextCoord = this.processInsert(doc, op.insert as string, attr, nextCoord, xStart);

                if (op.attributes && "align" in op.attributes) {
                    align = undefined;
                    xStart = marginLeft;
                    nextCoord.x = xStart;
                }
            }
        }

        return doc;
    }

    /**
     * 若 endWidthNewLine == true，则下一个的坐标定位在下一行，否则在本行末尾
     * @param doc 
     * @param text 
     * @param attributes 
     * @param coord 
     * @param xStart 
     * @returns 下一个的坐标
     */
    static processInsert(
        doc: jsPDF,
        text: string,
        attributes: IAttributeMap,
        coord: {x: number, y: number},
        xStart: number,
    ): {x: number, y: number} {
        const bold = attributes.bold || false;
        const italic = attributes.italic || false;
        // const underline = attributes.underline || false;
        // const strike = attributes.strike || false;
        const color = attributes.color || 'black';
        // const background = attributes.background || 'transparent';
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

        doc.setFont(font, fontStyle)
            .setFontSize(size)
            .setTextColor(color)

        doc.text(text, coord.x, coord.y, { baseline: "alphabetic"/* , align: align */});
        
        // doc.rect(coord.x, coord.y - doc.getLineHeight() / doc.internal.scaleFactor, attributes._w || 0, doc.getLineHeight() / doc.internal.scaleFactor); // Debug: view baseline point
        // doc.rect(xStart, coord.y - doc.getLineHeight() / doc.internal.scaleFactor, attributes._lw || 0, doc.getLineHeight() / doc.internal.scaleFactor); // Debug: view baseline point
        return this.computeNextXY(doc, coord.x, coord.y, xStart, text, attributes);
    }

    static computeNextXY(doc: jsPDF, x: number, y: number, xStart: number, text: string, attributes: IAttributeMap): {x: number, y: number} {
        let _x = x;
        let _y = y;
        if (text.endsWith("\n")) {
            _x = xStart;
            _y += doc.getLineHeight() / doc.internal.scaleFactor;
        } else {
            _x += attributes._w || 0;
        }
        return {x: _x, y: _y};
    }

}

export default QuillJsPdf;
