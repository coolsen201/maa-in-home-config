const kiosks = [
    { id: 'KHUB-NYC-001', location: 'New York, USA', status: 'online', uptime: '14d 2h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' },
    { id: 'KHUB-LDN-002', location: 'London, UK', status: 'pending', uptime: '0h 0m', heartbeat: '5m ago', meeting: '-' },
    { id: 'KHUB-TKY-003', location: 'Tokyo, JP', status: 'online', uptime: '2d 18h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' }
];

async function renderTable() {
    const body = document.getElementById('kiosk-body');
    const activeCount = document.getElementById('active-count');
    const totalCount = document.getElementById('stat-total');
    const onlineCountEl = document.getElementById('stat-online');
    const pendingCountEl = document.getElementById('stat-pending');

    try {
        const response = await fetch('/api/tunnels');
        const kiosks = await response.json();

        if (kiosks.error) throw new Error(kiosks.error);

        let onlineCount = 0;
        let pendingCount = 0;

        body.innerHTML = kiosks.map(k => {
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
        totalCount.innerText = kiosks.length;
        onlineCountEl.innerText = onlineCount;
        pendingCountEl.innerText = pendingCount;

    } catch (e) {
        console.error(e);
        body.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--red);">Error loading live data: ${e.message}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', renderTable);
