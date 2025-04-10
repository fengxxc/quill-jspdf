import ParagraphProvider from '../src/ParagraphProvider';
const ops = [
    {
        insert: 'Hello\n World\nSome initial '
    },
    {
        insert: 'bold',
        attributes: {
            bold: true
        }
    },
    {
        insert: ' text in center line'
    },
    {
        insert: '\n',
        attributes: {
            align: 'center'
        }
    },
    {
        insert: '\nnew line.\nand second new line.'
    },
    {
        insert: '\n',
        attributes: {
            align: 'right'
        }
    },
    {
        insert: '\nend line.\n'
    }
];
const acceptOpsRes = [
    {
        "insert": "Hello\n World\nSome initial ",
        "attributes": {
            "_ps": [
                {
                    "p": 1,
                    "i": 5
                },
                {
                    "p": 2,
                    "i": 12
                }
            ],
            "_start_align": {
                "align": "center",
                "index": 12
            }
        }
    },
    {
        "insert": "bold",
        "attributes": {
            "bold": true
        }
    },
    {
        "insert": " text in center line"
    },
    {
        "insert": "\n",
        "attributes": {
            "align": "center",
            "_ps": [
                {
                    "p": 3,
                    "i": 0
                }
            ]
        },
    },
    {
        "insert": "\nnew line.\nand second new line.",
        "attributes": {
            "_ps": [
                {
                    "p": 4,
                    "i": 0
                },
                {
                    "p": 5,
                    "i": 10
                }
            ],
            "_start_align": {
                "align": "right",
                "index": 10
            }
        }
    },
    {
        "insert": "\n",
        "attributes": {
            "align": "right",
            "_ps": [
                {
                    "p": 6,
                    "i": 0
                }
            ]
        }
    },
    {
        "insert": "\nend line.\n",
        "attributes": {
            "_ps": [
                {
                    "p": 7,
                    "i": 0
                },
                {
                    "p": 8,
                    "i": 10
                }
            ]
        }
    }
]

describe('testAccept', () => {
    it('test accept', () => {
        const provider = new ParagraphProvider();
        ops.forEach((op) => {
            const errCode = provider.accept(op);
            expect(errCode).toBe(0);
        });
        const qCache = provider.getQueueCache()
        // console.log(JSON.stringify(qCache, null, 4));
        expect(qCache).toStrictEqual(acceptOpsRes);
    });

    it('test consume', () => {
        const provider = new ParagraphProvider();
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
                "insert": "Hello\n",
                "attributes": {}
            }
        ]);

        /* second */
        const resOpSecond = provider.consume();
        // console.log(JSON.stringify(resOpSecond, null, 4));
        expect(resOpSecond).toStrictEqual([
            {
                "insert": " World\n",
                "attributes": {}
            }
        ]);

        /* third */
        provider.consume();
        provider.consume();
        const resOpThird = provider.consume();
        // console.log(JSON.stringify(resOpThird, null, 4));
        expect(resOpThird).toStrictEqual([
            {
                "insert": "Some initial ",
                "attributes": {
                    "start_align": "center"
                }
            },
            {
                "insert": "bold",
                "attributes": {
                    "bold": true
                },
            },
            {
                "insert": " text in center line"
            },
            {
                "insert": "\n",
                "attributes": {
                    "align": "center"
                }
            }
        ]);

        /* fourth */
        const resOpFourth = provider.consume();
        // console.log(JSON.stringify(resOpFourth, null, 4));
        expect(resOpFourth).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {}
            }
        ]);

        /* fifth */
        const resOpFifth = provider.consume();
        // console.log(JSON.stringify(resOpFifth, null, 4));
        expect(resOpFifth).toStrictEqual([
            {
                "insert": "new line.\n",
                "attributes": {}
            }
        ]);

        /* sixth */
        const resOpSixth = provider.consume();
        // console.log(JSON.stringify(resOpSixth, null, 4));
        expect(resOpSixth).toStrictEqual([
            {
                "insert": "and second new line.",
                "attributes": {
                    "start_align": "right"
                }
            },
            {
                "insert": "\n",
                "attributes": {
                    "align": "right"
                }
            }
        ]);

        /* seventh */
        const resOpSeventh = provider.consume();
        // console.log(JSON.stringify(resOpSeventh, null, 4));
        expect(resOpSeventh).toStrictEqual([
            {
                "insert": "\n",
                "attributes": {}
            }
        ]);

        /* eighth */
        const resOpEighth = provider.consume();
        // console.log(JSON.stringify(resOpEighth, null, 4));
        expect(resOpEighth).toStrictEqual([
            {
                "insert": "end line.\n",
                "attributes": {}
            }
        ]);
    });
});