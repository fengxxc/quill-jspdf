import { Op } from 'quill-delta';
import Iterator from '../src/Iterator';
const ops = [
    {
        insert: 'Hello World\nSome initial '
    },
    {
        attributes: {
            bold: true
        },
        insert: 'bold'
    },
    {
        insert: ' text in center line'
    },
    {
        attributes: {
            align: 'center'
        },
        insert: '\n'
    },
    {
        insert: '\nnew line.\nand second new line.'
    },
    {
        attributes: {
            align: 'right'
        },
        insert: '\n'
    },
    {
        insert: '\nend line.\n'
    }
];
const acceptOpsRes = [
    {
        "insert": "Hello World\nSome initial ",
        "attributes": {
            "_start_align": {
                "align": "center",
                "index": 11
            }
        }
    },
    {
        "attributes": {
            "bold": true
        },
        "insert": "bold"
    },
    {
        "insert": " text in center line"
    },
    {
        "attributes": {
            "align": "center"
        },
        "insert": "\n"
    },
    {
        "insert": "\nnew line.\nand second new line.",
        "attributes": {
            "_start_align": {
                "align": "right",
                "index": 10
            }
        }
    },
    {
        attributes: {
            "align": "right"
        },
        insert: '\n'
    },
    {
        "insert": "\nend line.\n"
    }
]
describe('testAccept', () => {
    it('BR_LEN equals 1', () => expect(Iterator.BR_LEN).toBe(1));

    it('op.startAlignAttr', () => {
        const it = new Iterator();
        ops.forEach(op => {
            it.accept(op);
        });
        const qCache = it.getQueueCache()
        // console.log(JSON.stringify(qCache, null, 4));
        // expect(JSON.stringify(qCache, null, 4)).toBe(JSON.stringify(acceptOpsRes, null, 4))
        expect(qCache).toStrictEqual(acceptOpsRes)
    });

    it('testGetBrLatter', () => {
        const t = "aa\nbb\ncc"
        expect(Iterator.getBrLatter(t, t.lastIndexOf('\n'))).toBe("cc");
    });

    it('testSplitOpByLastBr', () => {
        const op = {
            insert: 'aa\nbb\ncc',
            attributes: {
                bold: true,
                _start_align: {
                    align: 'right',
                    index: 5
                }
            }
        } as Op
        const res = Iterator.splitOpByLastBr(op);
        const toBeRes = [
            { insert: 'aa\nbb\n', attributes: { bold: true } },
            { insert: 'cc', attributes: { bold: true, start_align: 'right' } }
        ]
        expect(res).toStrictEqual(toBeRes);
    });

    it('testConsume', () => {
        const it = new Iterator();
        ops.forEach(op => {
            it.accept(op);
        });
        const resOpFirst: Op[] = it.consume();
        const resOp0Tobe: Op = {
            "insert": "Hello World\n",
            "attributes": {}
        }
        expect(resOpFirst[0]).toStrictEqual(resOp0Tobe);
        const resOp1Tobe: Op = {
            "insert": "Some initial ",
            "attributes": {
                "start_align": "center",
            }
        }
        expect(resOpFirst[1]).toStrictEqual(resOp1Tobe);
    })
});
