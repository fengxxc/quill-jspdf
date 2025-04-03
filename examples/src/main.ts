import './style.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import Quill from 'quill';
import QuillTableBetter from 'quill-table-better';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import { jsPDF } from 'jspdf';
import QuillJsPdf from '../../src/index';

(window as any).katex = katex;

if (typeof window.katex === 'undefined') {
    console.error('KaTeX 未加载，请检查导入');
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="height: 100vh;">
    <div id="left" style="width: 49%; height: calc(100% - 2px); display: inline-block; vertical-align: top;">
      <!-- Create the editor container -->
      <div id="toolbar">
        <span class="ql-formats">
          <select class="ql-font">
            <option selected>Aref Ruqaa</option>
            <option value="mirza">Mirza</option>
            <option value="roboto">Roboto</option>
            <option value="simhei">黑体</option>
          </select>
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
          <button class="ql-strike"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-size">
            <!-- Note a missing, not available option since the default size is 0 -->
            <option selected></option>
            <option value="13px">13px</option>
            <option value="24px">24px</option>
            <option value="36px">36px</option>
          </select>
        </span>
        <span class="ql-formats">
          <select class="ql-color"></select>
          <select class="ql-background"></select>
        </span>
        <span class="ql-formats">
          <button class="ql-script" value="sub"></button>
          <button class="ql-script" value="super"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-header" value="1"></button>
          <button class="ql-header" value="2"></button>
          <button class="ql-blockquote"></button>
          <button class="ql-code-block"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered"></button>
          <button class="ql-list" value="bullet"></button>
          <button class="ql-list" value="check"></button>
          <button class="ql-indent" value="-1"></button>
          <button class="ql-indent" value="+1"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-direction" value="rtl"></button>
          <select class="ql-align"></select>
        </span>
        <span class="ql-formats">
          <button class="ql-table-better"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-link"></button>
          <button class="ql-image"></button>
          <button class="ql-video"></button>
          <button class="ql-formula"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-clean"></button>
        </span>
      </div>
      <div id="editor" style=" height: calc(50% - 66px);">
          <p>1one two three four five six seven eight nine ten 2one two three four five six seven eight nine ten 3one two three four five six seven eight nine ten</p>
          <p class="ql-align-center">Some initial <strong>bold</strong> text</p>
          <p class="ql-font-simhei">中文</p>
          <p>end line.</p>
      </div>
      <div id="info-box" style="height: calc(50% - 0px);">
        <button id="btn1">getContents</button>
        <button id="render-html2canvas">渲染html2canvas</button>
        <button id="render-main">渲染main</button>
        <pre id="info" style="overflow-y: auto; margin: 0; height: calc(100% - 21px);">
        </pre>
      </div>
    </div>
    <div id="right" style="width: 50%; height: calc(100% - 5px); display: inline-block;">
      <embed id="pdf-embed" type="application/pdf" src="" width="100%" height="100%">
      </embed>
    </div>
  </div>
`;

Quill.register(
    {
        'modules/table-better': QuillTableBetter
    },
    true
);

var Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['13px', '24px', '36px'];
Quill.register(Size, true);

// Add fonts to whitelist
const Font = Quill.import('formats/font') as any;
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'roboto', 'simhei'];
Quill.register(Font, true);

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        // formula: true,
        table: false,
        'table-better': {
            language: 'en_US',
            menus: [
                'column',
                'row',
                'merge',
                'table',
                'cell',
                'wrap',
                'copy',
                'delete'
            ],
            toolbarTable: true
        },
        toolbar: '#toolbar',
        /* toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'],
            ['table-better'], // table-better

            [{ header: 1 }, { header: 2 }], // custom button values
            [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
            [{ align: [] }], // align
            [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
            [{ direction: 'rtl' }], // text direction

            // [{ size: ["small", "normal", "large", "huge", "14px", false] }], // custom dropdown
            // [{ size: ['14px', '16px', '18px', '20px', '24px', '32px'] }], // custom dropdown
            [{ size: ['13px', '15px', '18px', '21px'] }], // 显示时都变成Normal了，但功能是对的
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            [{ font: [] }],
            ['clean'] // remove formatting button
        ], */
        keyboard: {
            bindings: QuillTableBetter.keyboardBindings
        }
    }
});

// Landscape export, 2×4 inches
const doc = new jsPDF({
    //   orientation: "landscape",
    unit: 'px'
    //   format: [4, 2],
});

// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
document
    .querySelector<HTMLButtonElement>('#render-html2canvas')!
    .addEventListener('click', () => {
        renderHtml2canvas();
    });
document
    .querySelector<HTMLButtonElement>('#render-main')!
    .addEventListener('click', () => {
        renderMain();
    });
function renderHtml2canvas() {
    doc.html(quill.getSemanticHTML(), {
        callback: function (doc) {
            render(doc);
        },
        x: 10,
        y: 10,
        html2canvas: {
            scale: 0.5,
            logging: true,
            useCORS: true,
            width: 800,
            height: 600
        }
    });
    // doc.save("sample.pdf");
}

setTimeout(() => {
    renderMain();
}, 1000);

document.querySelector('#btn1')?.addEventListener('click', () => {
    const delta = quill.getContents();
    console.log(delta);
    const infoElement = document.querySelector('#info');
    if (infoElement) {
        infoElement.innerHTML = JSON.stringify(delta, null, 2);
    }
});

function render(doc: jsPDF) {
    const datauristring = doc.output('datauristring', {
        filename: 'sample.pdf'
    });
    document
        .querySelector<HTMLDivElement>('#pdf-embed')!
        .setAttribute('src', datauristring);
}

function renderMain() {
    const delta = quill.getContents();
    console.log(delta);
    const fonts = [{ url: 'fonts/SIMHEI.TTF', id: 'simhei', fontStyle: '' }];
    const pdf: jsPDF = QuillJsPdf.deltaToPdf(
        delta,
        {
            unit: 'px',
            //   orientation: "landscape",
            format: 'a4'
        },
        { title: 'This is title' },
        fonts
    );
    render(pdf);
}
