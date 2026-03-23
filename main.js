const kiosks = [
    { id: 'KHUB-NYC-001', location: 'New York, USA', status: 'online', uptime: '14d 2h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' },
    { id: 'KHUB-LDN-002', location: 'London, UK', status: 'pending', uptime: '0h 0m', heartbeat: '5m ago', meeting: '-' },
    { id: 'KHUB-TKY-003', location: 'Tokyo, JP', status: 'online', uptime: '2d 18h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' }
];

async function renderPendingTable() {
    const pendingBody = document.getElementById('pending-body');
    try {
        const response = await fetch('/api/pending');
        const pending = await response.json();

        if (!pending || pending.length === 0) {
            pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No pending requests</td></tr>`;
            return;
        }

        pendingBody.innerHTML = pending.map(k => `
            <tr>
                <td style="font-family: monospace; font-size: 0.85rem;">${k.uuid}</td>
                <td>
                  <span style="
                    font-size: 1.6rem;
                    font-weight: 700;
                    letter-spacing: 0.4rem;
                    color: #ffd700;
                    font-family: monospace;
                    background: rgba(255,215,0,0.08);
                    padding: 4px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,215,0,0.3);
                  ">${k.pin}</span>
                </td>
                <td>${new Date(k.lastSeen).toLocaleTimeString()}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="approveKiosk('${k.uuid}', '${k.pin}')">✅ Approve</button>
                    <button class="btn-icon" style="color: var(--red); margin-left: 10px;" onclick="rejectKiosk('${k.uuid}')">✗ Reject</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error loading pending registrations:', e);
        pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--red);">Error loading registrations</td></tr>`;
    }
}

async function rejectKiosk(uuid) {
    if (!confirm(`Reject station ${uuid}? This will remove it from the pending list.`)) return;
    // Simply acknowledge — the record will auto-expire in 24h from Vercel KV
    alert('Station rejected. It will be removed automatically.');
}

async function approveKiosk(uuid, expectedPin) {
    const enteredPin = prompt(
        `🔐 Enter the 6-digit code shown on the kiosk screen to approve station:\n\n${uuid}`
    );

    if (!enteredPin) return;

    if (enteredPin.trim() !== expectedPin.trim()) {
        alert('❌ Incorrect PIN. Please check the code on the kiosk screen and try again.');
        return;
    }

    try {
        const response = await fetch('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, pin: enteredPin.trim() })
        });

        const result = await response.json();

        if (result.approved) {
            alert(`✅ Station approved!\nSecure Key: ${result.secure_key}\n\nThe kiosk will now automatically launch the MaainHome app.`);
            renderPendingTable();
            renderTable();
        } else {
            alert('❌ Approval failed: ' + (result.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Error approving station: ' + e.message);
    }
}


async function renderTable() {
    const body = document.getElementById('kiosk-body');
    const activeCount = document.getElementById('active-count');
    const totalCount = document.getElementById('stat-total');
    const onlineCountEl = document.getElementById('stat-online');
    const pendingCountEl = document.getElementById('stat-pending');

    try {
        const response = await fetch('/api/tunnels');
        const liveKiosks = await response.json();

        if (liveKiosks.error) throw new Error(liveKiosks.error);

        let onlineCount = 0;
        let pendingCount = 0;

        body.innerHTML = liveKiosks.map(k => {
            if (k.status === 'online') onlineCount++;
            if (k.status === 'pending') pendingCount++;
            
            return `
                <tr>
                    <td style="font-weight: 600;">${k.id}</td>
                    <td>${k.location}</td>
                    <td><span class="status-badge ${k.status}">${k.status.toUpperCase()}</span></td>
                    <td>${k.uptime}</td>
                    <td>${k.heartbeat}</td>
                    <td>
                        <button class="btn-icon">Manage</button>
                        <button class="btn-icon" style="color: var(--red);">Revoke</button>
                    </td>
                </tr>
            `;
        }).join('');

        activeCount.innerText = onlineCount;
        totalCount.innerText = liveKiosks.length;
        onlineCountEl.innerText = onlineCount;
        pendingCountEl.innerText = pendingCount;

    } catch (e) {
        console.error(e);
        // Fallback to static mock data if API fails
        body.innerHTML = kiosks.map(k => `
            <tr>
                <td style="font-weight: 600;">${k.id}</td>
                <td>${k.location}</td>
                <td><span class="status-badge ${k.status}">${k.status.toUpperCase()}</span></td>
                <td>${k.uptime}</td>
                <td>${k.heartbeat}</td>
                <td>
                    <button class="btn-icon">Manage</button>
                </td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    renderPendingTable();
    // Poll for pending every 10s
    setInterval(renderPendingTable, 10000);
});
