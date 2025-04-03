import { Op } from "quill-delta";

interface StartAlignAttr {
    align: "left" | "center" | "right" | "justify";
    index: number;
}

export default class Iterator {
    static BR_LEN = `\\n`.length;

    private _queueCache = new Array<Op>();
    private _lastHasBrOpIdx = -1;
    private _lastBrIdx = -1;
    public accept(op: Op): void {
        if (!("insert" in op) || op.insert == null || typeof op.insert !== 'string') {
            return;
        }

        if (op.insert === '\n' && op.attributes && op.attributes?.align) {
            const saa = {
                align: op.attributes.align,
                index: this._lastBrIdx
            } as StartAlignAttr;
            if (this._queueCache[this._lastHasBrOpIdx].attributes === undefined) {
                this._queueCache[this._lastHasBrOpIdx].attributes = {};
            }
            this._queueCache[this._lastHasBrOpIdx].attributes!["_start_align"] = saa;
            this._lastHasBrOpIdx = -1;
            this._lastBrIdx = -1;
            this._queueCache.push(op);
            return;
        }

        const lastBrIdx = op.insert.lastIndexOf('\n');
        if (!op.insert.endsWith('\n') && -1 < lastBrIdx) {
            this._lastHasBrOpIdx = this._queueCache.length;
            this._lastBrIdx = lastBrIdx;
        }
        this._queueCache.push(op);
    }

    public getQueueCache(): Array<Op> {
        return this._queueCache;
    }
}