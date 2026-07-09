const fs = require('fs');
const path = require('path');

function walk(dir, result) {
    result = result || [];
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, result);
        else if (e.name.endsWith('.md')) result.push(full);
    }
    return result;
}

const base = 'C:/Users/84113/hexo-blog/source/_posts/';
const files = walk(base);
files.forEach(function(f) {
    const content = fs.readFileSync(f, 'utf-8');
    if (!content.startsWith('---')) return;
    const idx2 = content.indexOf('---', 3);
    if (idx2 === -1) return;
    const fm = content.substring(3, idx2);

    const lines = fm.split('\n');
    let inTags = false;
    const tagLines = [];
    for (const line of lines) {
        const stripped = line.trim();
        if (stripped === 'tags:') { inTags = true; continue; }
        if (inTags) {
            if (stripped.startsWith('-')) tagLines.push(stripped);
            else if (stripped === '') continue;
            else inTags = false;
        }
    }

    if (tagLines.length > 0) {
        const short = f.slice(base.length).split('\\').join('/');
        console.log(short + ': ' + tagLines.join(' | '));
    }
});
