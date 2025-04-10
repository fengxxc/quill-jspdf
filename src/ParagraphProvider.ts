import { AttributeMap, Op } from 'quill-delta';
import AlignProvider, { ErrCode } from './AlignProvider';

interface ParagraphAttr {
    p: number; // paragraph number, start from 0
    i: number; // "\n" char index, start from 0
}

export default class ParagraphProvider extends AlignProvider {
    private _pNum = 1;
    private _paragraphs: Map<number, Op[]> = new Map<number, Op[]>();
    private _consumePIdx: number = 0;

    public accept(op: Op): ErrCode {
        const errCode = super.accept(op);
        if (errCode < 0) {
            return errCode;
        }

        const input = op.insert as string;

        const ps = [];
        let i = -1;

        // 循环查找每个换行符
        while ((i = input.indexOf('\n', i + 1)) !== -1) {
            ps.push({
                p: this._pNum,
                i: i
            } as ParagraphAttr);
            this._pNum++;
        }
        if (ps.length > 0) {
            if (op.attributes === undefined) {
                op.attributes = {};
            }
            op.attributes._ps = ps;
        }
        return 0;
    }

    public consume(): Op[] {
        const alignSplits: Op[] = super.consume();
        if (alignSplits.length == 2 && alignSplits[1].attributes && "_ps" in alignSplits[1].attributes) {
            delete alignSplits[1].attributes!._ps
        }
        for (let i = 0; i < alignSplits.length; i++) {
            const op = alignSplits[i];
            const insert = op.insert as string;
            if (op.attributes && "_ps" in op.attributes) {
                const ps = op.attributes._ps as ParagraphAttr[];
                for (let j = 0; j < ps.length; j++) {
                    const p = ps[j];

                    /* append to last paragraph */
                    if (j == 0) {
                        const _op0 = {
                            insert: insert.slice(0, p.i + 1),
                            attributes: ParagraphProvider.cleanAttributes(op.attributes, "_ps")
                        } as Op;
                        this._appendParagraph(_op0);
                    }

                    /* append to current paragraph */
                    const PEndIndex = (j + 1 < ps.length) ? ps[j + 1].i + 1 : insert.length;
                    if (p.i + 1 == PEndIndex) {
                        this._consumePIdx = p.p;
                        continue;
                    }
                    const _op = {
                        insert: insert.slice(p.i + 1, PEndIndex),
                        attributes: ParagraphProvider.cleanAttributes(op.attributes, "_ps")
                    } as Op;
                    this._consumePIdx = p.p;
                    this._appendParagraph(_op);
                }
            } else {
                this._appendParagraph(op);
            }
        }
        if (this._paragraphs.size > 1) {
            const minKey = Math.min(...this._paragraphs.keys());
            const ops: Op[] = this._paragraphs.get(minKey)!;
            this._paragraphs.delete(minKey);
            return ops;
        }
        if (this._paragraphs.size == 1) {
            const n: IteratorResult<[number, Op[]], undefined> = this._paragraphs.entries().next();
            const ops: Op[] = n.value![1];
            if (this.hasFinishedSign(ops[ops.length - 1])) {
                return ops;
            }
        }
        return [];
    }

    private _appendParagraph(op: Op) {
        if (!(this._paragraphs.has(this._consumePIdx))) {
            this._paragraphs.set(this._consumePIdx, [op]);
        } else {
            this._paragraphs.get(this._consumePIdx)?.push(op);
        }
    }

    private static cleanAttributes(attributes: AttributeMap, ...removeKeys: string[]): AttributeMap {
        const newAttributes: AttributeMap = { ...attributes };
        for (const key of removeKeys) {
            delete newAttributes[key];
        }
        return newAttributes;
    }

}
