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
      <div id="editor" style=" height: calc(50% - 66px);">
          <p>Hello Hello World!</p>
          <p>Some initial <strong>bold</strong> text</p>
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
Size.whitelist = ['13px', '15px', '18px', '21px'];
Quill.register(Size, true);

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
        toolbar: [
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
        ],
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
    const pdf: jsPDF = QuillJsPdf.deltaToPdf(delta, 800);
    render(pdf);
}
