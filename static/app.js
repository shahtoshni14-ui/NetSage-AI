let current = null;
let lastDiagnosis = null;
let decision = 'Accepted';

const sel = document.getElementById('caseSelect');

sel.addEventListener('change', async () => {
    current = sel.value || null;

    if (!current) {
        document.getElementById('casePreview').className = 'case-preview empty';
        document.getElementById('casePreview').innerHTML =
            '<span class="pulse-dot"></span><span>Select a case to preview the evidence.</span>';
        return;
    }

    const opt = sel.options[sel.selectedIndex];

    document.getElementById('casePreview').className = 'case-preview';

    document.getElementById('casePreview').innerHTML =
        '<span class="pulse-dot"></span><div><b>' +
        esc(opt.dataset.search.split(' ').slice(0, 3).join(' ')) +
        '</b><br><span>Evidence will be loaded when diagnosis runs.</span></div>';
});


function filterCases() {
    const q = document.getElementById('caseSearch').value.toLowerCase();

    [...sel.options].forEach((o, i) => {
        if (i === 0) return;

        o.hidden = q &&
            !(o.dataset.search || '').toLowerCase().includes(q);
    });
}


async function diagnose() {

    if (!current) {
        alert('Select a case first.');
        return;
    }

    const result = document.getElementById('result');
    const badge = document.getElementById('engineBadge');

    badge.textContent = 'Gemini analysing…';

    result.innerHTML = `
        <div class="diagnosis-empty">
            <div class="ai-orbit">
                <div class="orbit-dot"></div>
                <span>AI</span>
            </div>

            <h3>Analysing evidence…</h3>

            <p>
                Gemini is checking symptoms, show-command evidence
                and deterministic rules.
            </p>

            <p style="font-size:13px;opacity:.65;margin-top:12px">
                This may take up to 60 seconds.
            </p>
        </div>
    `;

    try {

        const controller = new AbortController();

        // Prevent the browser from waiting forever.
        const timeout = setTimeout(() => {
            controller.abort();
        }, 70000);

        const r = await fetch('/api/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                case_id: current
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        const data = await r.json();

        if (!r.ok || data.error) {
            throw new Error(data.error || 'Diagnosis request failed.');
        }

        lastDiagnosis = data;

        badge.textContent =
            lastDiagnosis.engine || 'Diagnosis ready';

        render(lastDiagnosis);

        document.getElementById('casePreview').innerHTML =
            '<span class="pulse-dot"></span><div><b>Case loaded</b><br>' +
            '<span>Evidence attached to this diagnosis.</span></div>';

    }

    catch (e) {

        if (e.name === 'AbortError') {

            badge.textContent = 'Diagnosis timeout';

            result.innerHTML = `
                <div class="safety-note">
                    Gemini response was slow. NetSage is using its evidence-based fallback engine.
                </div>
            `;

        } else {

            badge.textContent = 'Diagnosis error';

            result.innerHTML = `
                <div class="safety-note">
                    Unable to diagnose: ${esc(e.message)}
                </div>
            `;
        }
    }
}


function render(d) {

    const ev = (d.evidence || [])
        .map(x => '<div class="finding">' + esc(x) + '</div>')
        .join('');

    const fixes = (d.fix_steps || [])
        .map(x => '<li>' + esc(x) + '</li>')
        .join('');

    document.getElementById('result').innerHTML = `

        <div class="result-grid">

            <div class="metric">
                <small>Root cause</small>
                <b>${esc(d.root_cause || 'Unknown')}</b>
            </div>

            <div class="metric">
                <small>Confidence</small>
                <b>${esc(d.confidence || '—')}</b>
            </div>

            <div class="metric">
                <small>OSI layer</small>
                <b>${esc(d.osi_layer || '—')}</b>
            </div>

            <div class="metric">
                <small>Next command</small>
                <b>
                    <code>${esc(d.next_command || '—')}</code>
                </b>
            </div>

        </div>

        <div class="diagnosis-section">

            <label>Evidence used</label>

            <div class="evidence">
                ${ev}
            </div>

        </div>

        <div class="diagnosis-section">

            <label>Recommended fix path</label>

            <ol class="fixes">
                ${fixes}
            </ol>

        </div>

        <div class="safety-note">
            ${esc(
                d.safety_note ||
                'Human review required before applying any change.'
            )}
        </div>
    `;
}


function setDecision(btn) {

    document
        .querySelectorAll('.decision')
        .forEach(b => b.classList.remove('selected'));

    btn.classList.add('selected');

    decision = btn.dataset.status;
}


async function review() {

    if (!current || !lastDiagnosis) {
        alert('Run a diagnosis first.');
        return;
    }

    const body = {
        case_id: current,
        status: decision,
        accepted_fault:
            document.getElementById('acceptedFault').value,
        reviewer_note:
            document.getElementById('note').value
    };

    const r = await fetch('/api/review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (r.ok) {

        document.getElementById('reviewMsg').innerHTML =
            '<span style="color:#53e0a0">✓ Review saved as ' +
            decision +
            '</span>';

        loadStats();

    } else {

        document.getElementById('reviewMsg').textContent =
            'Could not save review.';
    }
}


async function loadStats() {

    const r = await fetch('/api/stats');

    const s = await r.json();

    const total =
        Object.values(s.issue_counts)
            .reduce((a, b) => a + b, 0) || 1;

    const bars =
        Object.entries(s.issue_counts)
            .map(([k, v]) =>
                '<div class="bar" title="' +
                k +
                ': ' +
                v +
                '" style="height:' +
                Math.max(10, Math.round(v / total * 100)) +
                '%"></div>'
            )
            .join('');

    document.getElementById('stats').innerHTML = `

        <div class="card stat-card">
            <small>Total cases</small>
            <b>${s.cases}</b>
            <span>Structured troubleshooting library</span>
            <div class="bars">${bars}</div>
        </div>

        <div class="card stat-card">
            <small>Reviewed</small>
            <b>
                ${s.reviews.Accepted +
                  s.reviews.Edited +
                  s.reviews.Rejected}
            </b>
            <span>Human decisions recorded</span>
        </div>

        <div class="card stat-card">
            <small>AI / human agreement</small>
            <b>${s.agreement}%</b>
            <span>Accepted diagnoses / reviewed cases</span>
        </div>

        <div class="card stat-card">
            <small>Issue categories</small>
            <b>${Object.keys(s.issue_counts).length}</b>
            <span>VLAN · DHCP · DNS · ACL · NAT · more</span>
        </div>
    `;
}


function esc(x) {

    return String(x ?? '').replace(
        /[&<>"']/g,
        m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m])
    );
}


loadStats();