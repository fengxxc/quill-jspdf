import { Op } from 'quill-delta';
import AlignProvider from '../src/AlignProvider';
const ops = [
    {
        insert: 'Hello\n World\nSome initial '
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
        "insert": "Hello\n World\nSome initial ",
        "attributes": {
            "_start_align": {
                "align": "center",
                "index": 12
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
    it('BR_LEN equals 1', () => expect(AlignProvider.BR_LEN).toBe(1));

    it('op.startAlignAttr', () => {
        const it = new AlignProvider();
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
        expect(AlignProvider.getBrLatter(t, t.lastIndexOf('\n'))).toBe("cc");
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
        const res = AlignProvider.splitOpByLastBr(op);
        const toBeRes = [
            { insert: 'aa\nbb\n', attributes: { bold: true } },
            { insert: 'cc', attributes: { bold: true, start_align: 'right' } }
        ]
        expect(res).toStrictEqual(toBeRes);
    });

    it('testConsume', () => {
        const it = new AlignProvider();
        ops.forEach(op => {
            it.accept(op);
        });
        /* first */
        const resOpFirst: Op[] = it.consume();
        const resOp0Tobe: Op = {
            "insert": "Hello\n World\n",
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

        /* second */
        const resOpSecond: Op[] = it.consume();
        const resOp2Tobe: Op = {
            "insert": "bold",
            "attributes": {
                "bold": true
            }
        }
        expect(resOpSecond[0]).toStrictEqual(resOp2Tobe);

        /* third */
        const resOpThird: Op[] = it.consume();
        const resOp3Tobe: Op = {
            "insert": " text in center line",
        }
        expect(resOpThird[0]).toStrictEqual(resOp3Tobe);

        /* fourth */
        const resOpFourth: Op[] = it.consume();
        const resOp4Tobe: Op = {
            "insert": "\n",
            "attributes": {
                "align": "center"
            }
        }
        expect(resOpFourth[0]).toStrictEqual(resOp4Tobe);

        /* fifth */
        const resOpFifth: Op[] = it.consume();
        const resOp5Tobe: Op = {
            "insert": "\nnew line.\n",
            "attributes": {}
        }
        expect(resOpFifth[0]).toStrictEqual(resOp5Tobe);

        const resOp6Tobe: Op = {
            "insert": "and second new line.",
            "attributes": {
                "start_align": "right",
            }
        }
        expect(resOpFifth[1]).toStrictEqual(resOp6Tobe);

        /* sixth */
        const resOpSixth: Op[] = it.consume();
        const resOp7Tobe: Op = {
            "insert": "\n",
            "attributes": {
                "align": "right"
            }
        }
        expect(resOpSixth[0]).toStrictEqual(resOp7Tobe);

        /* eighth */
        const resOpEighth: Op[] = it.consume();
        const resOp8Tobe: Op = {
            "insert": "\nend line.\n",
        }
        expect(resOpEighth[0]).toStrictEqual(resOp8Tobe);
    })
});
