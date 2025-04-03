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
    it('BR_LEN equals 2', () => expect(Iterator.BR_LEN).toBe(2));

    it('op.startAlignAttr', () => {
        const it = new Iterator();
        ops.forEach(op => {
            it.accept(op);
        });
        const qCache = it.getQueueCache()
        console.log(JSON.stringify(qCache, null, 4));
        expect(JSON.stringify(qCache, null, 4)).toBe(JSON.stringify(acceptOpsRes, null, 4))
    });
});
