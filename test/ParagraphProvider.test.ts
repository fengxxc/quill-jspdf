import { Op } from 'quill-delta';
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
const consumeOpsRes = [
    [
        {
            "insert": "Hello\n",
            "attributes": {}
        }
    ],
    [
        {
            "insert": " World\n",
            "attributes": {}
        }
    ],
    [
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
    ],
    [
        {
            "insert": "\n",
            "attributes": {}
        }
    ],
    [
        {
            "insert": "new line.\n",
            "attributes": {}
        }
    ],
    [
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
    ],
    [
        {
            "insert": "\n",
            "attributes": {}
        }
    ],
    [
        {
            "insert": "end line.\n",
            "attributes": {}
        }
    ]
];

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

        const opsRes: Array<Op[]> = [];
        while (!provider.isFinished()) {
            const ops: Op[] = provider.consume();
            if (ops.length === 0) {
                continue;
            }
            opsRes.push(ops);
        }
        // console.log(JSON.stringify(opsRes, null, 4));
        expect(opsRes).toStrictEqual(consumeOpsRes);

    });
});