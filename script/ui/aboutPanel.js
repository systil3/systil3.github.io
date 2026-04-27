const aboutPanel  = document.getElementById('about-panel');
const aboutClose  = document.getElementById('about-close');
const aboutScreen = document.getElementById('about-screen');
const ruler       = document.getElementById('about-ruler');

function visualWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(ch) ? 2 : 1;
  }
  return w;
}

function calcCols() {
  const charW   = ruler.getBoundingClientRect().width;
  const screenW = aboutScreen.clientWidth
                - parseFloat(getComputedStyle(aboutScreen).paddingLeft)
                - parseFloat(getComputedStyle(aboutScreen).paddingRight);
  return Math.floor(screenW / charW) - 1;
}

// { type: 'field', prefix, hyphens, suffix } | { type: 'plain', text }
function buildLines(data, cols) {
  const lines = [];

  const addPlain  = text  => lines.push({ type: 'plain', text });
  const addSep    = ()    => addPlain('-'.repeat(cols));
  const addField  = (label, value) => {
    const prefix  = '* ' + label + ' ';
    const suffix  = ' ' + value;
    const hyphens = Math.max(2, cols - visualWidth(prefix) - visualWidth(suffix));
    lines.push({ type: 'field', prefix, hyphens: '-'.repeat(hyphens), suffix });
  };

  if (data.bio)  { addPlain(data.bio); addPlain(''); }
  addSep(); addPlain('');
  for (const f of (data.fields ?? []))    addField(f.label, f.value);
  if (data.education?.length) {
    addPlain(''); addSep(); addPlain('');
    for (const e of data.education)       addField(e.label, e.value);
  }
  addPlain('');
  return lines;
}

let animating = false;

async function type(node, text, delay) {
  for (const ch of text) {
    if (!animating) return;
    node.textContent += ch;
    await new Promise(r => setTimeout(r, delay));
  }
}

async function typeLines(lines) {
  aboutScreen.innerHTML = '';

  for (const line of lines) {
    if (!animating) return;

    if (line.type === 'plain') {
      const span = document.createElement('span');
      span.className = 'ab-plain';
      aboutScreen.appendChild(span);
      await type(span, line.text, 2);

    } else {
      // field: prefix (bold) + hyphens (dim) + suffix (bold)
      const pre  = document.createElement('span'); pre.className  = 'ab-bold';
      const hyp  = document.createElement('span'); hyp.className  = 'ab-dim';
      const suf  = document.createElement('span'); suf.className  = 'ab-plain';
      aboutScreen.appendChild(pre);
      await type(pre, line.prefix, 2);
      aboutScreen.appendChild(hyp);
      await type(hyp, line.hyphens, 1);
      aboutScreen.appendChild(suf);
      await type(suf, line.suffix, 2);
    }

    aboutScreen.appendChild(document.createTextNode('\n'));
    await new Promise(r => setTimeout(r, line.text === '' ? 10 : 6));
  }

  if (animating) {
    const cursor = document.createTextNode('█');
    aboutScreen.appendChild(cursor);
    const blink = setInterval(() => {
      if (!animating) { clearInterval(blink); cursor.textContent = ''; return; }
      cursor.textContent = cursor.textContent === '█' ? ' ' : '█';
    }, 500);
  }
}

async function runAnimation() {
  const data  = await fetch('/links/about.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const cols  = calcCols();
  typeLines(buildLines(data, cols));
}

export function openAbout() {
  if (animating || aboutPanel.classList.contains('open')) return;
  aboutPanel.classList.add('open');
  animating = true;
  requestAnimationFrame(() => requestAnimationFrame(() => runAnimation()));
}

export function closeAbout() {
  animating = false;
  aboutPanel.classList.remove('open');
}

aboutClose.addEventListener('click', closeAbout);
