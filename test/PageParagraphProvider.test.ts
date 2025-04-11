import jsPDF from 'jspdf';
import PageParagraphProvider from '../src/PageParagraphProvider';

const ops = [
    {
        insert: '1one two three four five six seven eight nine ten 2one two three four five six seven eight nine ten 3one two three four five six seven eight nine ten\nSome initial '
    },
    {
        attributes: {
            bold: true
        },
        insert: 'bold'
    },
    {
        insert: ' text'
    },
    {
        attributes: {
            align: 'center'
        },
        insert: '\n'
    },
    {
        insert: '\nend line.\n'
    }
];

describe('PageParagraphProvider', () => {
    it('should accept ops and consume them', () => {
        const doc = new jsPDF({
            unit: 'px',
            format: 'a4'
        });
        const width = doc.internal.pageSize.getWidth() - (2.5 * 2); // 2.5px margin on each side
        // doc.setFontSize(12);
        const provider = new PageParagraphProvider(doc, width);
        ops.forEach((op) => {
            const errCode = provider.accept(op);
            expect(errCode).toBe(0);
        });
        provider.setFinished();

        /* first */
        const resOpFirst = provider.consume();
        // console.log(JSON.stringify(resOpFirst, null, 4));
        expect(resOpFirst).toStrictEqual([
            {
                "insert": "1one two three four five six seven eight nine ten 2one two three four five six seven eight nine ten 3one two\n",
                "attributes": {}
            },
            {
                "insert": "three four five six seven eight nine ten\n",
                "attributes": {}
            }
        ]);

        /* second */
        provider.consume()
        provider.consume()
        provider.consume()
        const resOpSecond = provider.consume();
        // console.log(JSON.stringify(resOpSecond, null, 4));
        expect(resOpSecond).toStrictEqual([
            {
                "insert": "Some initial ",
                "attributes": {
                    "start_align": "center"
                }
            },
            {
                "attributes": {
                    "bold": true
                },
                "insert": "bold"
            },
            {
                "insert": " text"
            },
            {
                "insert": "\n",
                "attributes": {
                    "align": "center"
                }
            }
        ]);

        /* third */
        const resOpThird = provider.consume();
        // console.log(JSON.stringify(resOpThird, null, 4));
        expect(resOpThird).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {}
            }
        ]);

        /* fourth */
        const resOpFourth = provider.consume();
        // console.log(JSON.stringify(resOpFourth, null, 4));
        expect(resOpFourth).toStrictEqual([
            {
                "insert": "end line.\n",
                "attributes": {}
            }
        ]);
    });
});
