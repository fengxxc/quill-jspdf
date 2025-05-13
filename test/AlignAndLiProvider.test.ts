import { Op } from 'quill-delta';
import AlignAndLiProvider from '../src/AlignAndLiProvider';
const ops = [
    {
        "insert": "first list right line",
    },
    {
        "attributes": {
            "align": "right",
            "list": "bullet"
        },
        "insert": "\n"
    },
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
        insert: '\nend line.'
    },
    {
        "attributes": {
          "list": "ordered"
        },
        "insert": "\n"
    }
];
const acceptOpsRes = [
    {
        "insert": "first list right line",
        "attributes": {
            "_start_align": {
                "align": "right",
                "index": -1
            },
            "start_list":  "bullet"
        }
    },
    {
        "attributes": {
            "align": "right",
            "list": "bullet"
        },
        "insert": "\n"
    },
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
        "insert": "\nend line.",
        "attributes": {
            "start_list": "ordered"
        }
    },
    {
        "attributes": {
            "list": "ordered"
        },
        "insert": "\n"
    }
]
describe('testAccept', () => {
    it('BR_LEN equals 1', () => expect(AlignAndLiProvider.BR_LEN).toBe(1));

    it('op.startAlignAttr', () => {
        const it = new AlignAndLiProvider();
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
        expect(AlignAndLiProvider.getBrLatter(t, t.lastIndexOf('\n'))).toBe("cc");
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
        const res = AlignAndLiProvider.splitOpByLastBr(op);
        const toBeRes = [
            { insert: 'aa\nbb\n', attributes: { bold: true } },
            { insert: 'cc', attributes: { bold: true, start_align: 'right' } }
        ]
        expect(res).toStrictEqual(toBeRes);
    });

    it('testConsume', () => {
        const it = new AlignAndLiProvider();
        ops.forEach(op => {
            it.accept(op);
        });

        expect(it.consume()).toStrictEqual([
            {
            "insert": "first list right line",
            "attributes": {
                "start_align": "right",
                "start_list":  "bullet"
            }
        }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {
                    "align": "right",
                    "list": "bullet"
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "Hello\n World\n",
                "attributes": {}
            },
            {
                "insert": "Some initial ",
                "attributes": {
                    "start_align": "center",
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "bold",
                "attributes": {
                    "bold": true
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": " text in center line",
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {
                    "align": "center"
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\nnew line.\n",
                "attributes": {}
            },
            {
                "insert": "and second new line.",
                "attributes": {
                    "start_align": "right",
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {
                    "align": "right"
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\nend line.",
                "attributes": {
                    "start_list": "ordered"
                }
            }
        ]);

        expect(it.consume()).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {
                    "list": "ordered"
                }
            }
        ])
    })

    it('test first line align right', () => {

        const _ops = [
            {
                insert: 'Hello'
            },
            {
                attributes: {
                    align: 'right'
                },
                insert: '\n'
            },
        ];

        const it = new AlignAndLiProvider();
        _ops.forEach(op => {
            it.accept(op);
        });

        /* first */
        const resOpFirst: Op[] = it.consume();
        // console.log(JSON.stringify(resOpFirst, null, 4));
        const resOp0Tobe: Op = {
            "insert": "Hello",
            "attributes": {
                "start_align": "right",
            }
        }
        expect(resOpFirst[0]).toStrictEqual(resOp0Tobe);

        /* second */
        const resOpSecond: Op[] = it.consume();
        // console.log(JSON.stringify(resOpSecond, null, 4));
        const resOp1Tobe: Op = {
            "insert": "\n",
            "attributes": {
                "align": "right",
            }
        }
        expect(resOpSecond[0]).toStrictEqual(resOp1Tobe);
    });
});
