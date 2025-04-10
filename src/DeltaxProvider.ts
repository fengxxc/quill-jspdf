import { Op } from "quill-delta";

interface StartAlignAttr {
    align: "left" | "center" | "right" | "justify";
    index: number;
}

export type ErrCode = -1 | 0;

export default class DeltaxProvider {
    static BR_LEN = `\n`.length;

    private _queueCache = new Array<Op>();
    private _lastHasBrOpIdx = -1;
    private _lastBrIdx = -1;

    public accept(op: Op): ErrCode {
        if (!("insert" in op) || op.insert == null || typeof op.insert !== 'string') {
            console.error("Invalid insert: " + op);
            return -1;
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
            return 0;
        }

        const lastBrIdx = op.insert.lastIndexOf('\n');
        if (!op.insert.endsWith('\n') && -1 < lastBrIdx) {
            this._lastHasBrOpIdx = this._queueCache.length;
            this._lastBrIdx = lastBrIdx;
        }
        this._queueCache.push(op);
        return 0;
    }

    public setFinished() {
        this._queueCache.push({attributes: {_end: true}} as Op);
    }

    public isFinished() {
        if (!this.hasNext()) {
            return false;
        }
        const last: Op =  this._queueCache[0];
        return this.hasFinishedSign(last);
    }

    protected hasFinishedSign(op: Op) {
        return op.attributes && ("_end" in op.attributes) && op.attributes._end;
    }

    private hasNext(): boolean {
        return this._queueCache.length > 0;
    }

    private take(): Op {
        return this._queueCache.shift()!;
    }

    public static isAlignStart(op: Op) {
        return op.attributes && "_start_align" in op.attributes;
    }

    public static getBrLatter(str: string, brIndex: number) {
        return str.slice(brIndex + DeltaxProvider.BR_LEN);
    }

    public consume(): Op[] {
        if (!this.hasNext()) {
            return [];
        }
        const op = this.take();
        if (DeltaxProvider.isAlignStart(op)) {
            return DeltaxProvider.splitOpByLastBr(op);
        }
        return [op];
    }

    /**
     * 裂解出一个带开始标识的、换行符后的内容
     * @param op 
     * @returns 
     */
    public static splitOpByLastBr(op: Op): Op[] {
        const saa = op.attributes!["_start_align"] as StartAlignAttr;
        if (typeof op.insert !== "string") {
            return [op]; // TODO
        }
        const newText = DeltaxProvider.getBrLatter(op.insert as string, saa.index);
        op.insert = op.insert.slice(0, saa.index + DeltaxProvider.BR_LEN);
        delete op.attributes!["_start_align"]
        const newOp = {
            insert: newText,
            attributes: { ...op.attributes, start_align: saa.align }
        } as Op;
        return [op, newOp];
    }

    public getQueueCache(): Array<Op> {
        return this._queueCache;
    }
}
