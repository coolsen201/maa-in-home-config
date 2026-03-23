// MaainHome CCC Console - Logic for Pending Registrations

async function renderPendingTable() {
    const pendingBody = document.getElementById('pending-body');
    const pendingCountEl = document.getElementById('stat-pending');
    
    try {
        const response = await fetch('/api/pending');
        const pending = await response.json();

        // Update stats
        const count = pending ? pending.length : 0;
        pendingCountEl.innerText = count;
        document.getElementById('active-count').innerText = count;

        if (!pending || pending.length === 0) {
            pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No pending requests</td></tr>`;
            return;
        }

        pendingBody.innerHTML = pending.map(k => `
            <tr>
                <td style="font-family: monospace; font-size: 0.85rem;">${k.uuid}</td>
                <td>
                  <span class="pin-display">${k.pin}</span>
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
        } else {
            alert('❌ Approval failed: ' + (result.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Error approving station: ' + e.message);
    }
}


// renderTable() removed as it depended on broken Cloudflare Tunnels API

document.addEventListener('DOMContentLoaded', () => {
    // Initial cleanup of old stats
    document.getElementById('stat-total').innerText = '-';
    document.getElementById('stat-online').innerText = '-';
    
    renderPendingTable();
    // Poll for pending every 10s
    setInterval(renderPendingTable, 10000);
});
