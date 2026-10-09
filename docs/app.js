
const CASES = [{"id": "NS-01", "issue": "VLAN", "severity": "High", "title": "VLAN 10 missing from trunk", "symptom": "PC in VLAN 10 cannot reach the server across the switch uplink.", "evidence": "show vlan brief: VLAN 10 exists. show interfaces trunk: VLAN 10 is missing from the allowed VLAN list.", "fault": "VLAN 10 is not permitted on the trunk link.", "osi": "Layer 2", "concept": "802.1Q trunking", "next": "show interfaces trunk", "fix": "Permit VLAN 10 on the trunk and verify the allowed VLAN list.", "check": "Trunk evidence does not contain VLAN 10 in the allowed list."}, {"id": "NS-02", "issue": "VLAN", "severity": "High", "title": "Access port assigned to wrong VLAN", "symptom": "A host connected to Gi0/3 cannot communicate with devices in its expected VLAN.", "evidence": "show vlan brief: Gi0/3 is assigned to VLAN 20, while the endpoint should be in VLAN 10.", "fault": "Gi0/3 is assigned to the wrong access VLAN.", "osi": "Layer 2", "concept": "Access VLAN assignment", "next": "show running-config interface Gi0/3", "fix": "Assign Gi0/3 to the correct access VLAN and verify the port status.", "check": "Port Gi0/3 is mapped to VLAN 20 instead of VLAN 10."}, {"id": "NS-03", "issue": "VLAN", "severity": "Medium", "title": "Required VLAN not created", "symptom": "A host configured for VLAN 30 has no local connectivity.", "evidence": "show vlan brief: VLAN 30 is not present on the switch.", "fault": "VLAN 30 has not been created on the switch.", "osi": "Layer 2", "concept": "VLAN creation", "next": "show vlan brief", "fix": "Create VLAN 30, then verify port membership.", "check": "Expected VLAN 30 is absent from the VLAN table."}, {"id": "NS-04", "issue": "VLAN", "severity": "Medium", "title": "Native VLAN mismatch", "symptom": "Inter-switch connectivity is unstable and trunk warnings appear.", "evidence": "show interfaces trunk: one side uses native VLAN 99 and the other uses native VLAN 1.", "fault": "The native VLAN is mismatched between trunk endpoints.", "osi": "Layer 2", "concept": "Native VLAN", "next": "show interfaces trunk", "fix": "Configure the same native VLAN on both trunk endpoints and verify.", "check": "Native VLAN values differ between the two trunk endpoints."}, {"id": "NS-05", "issue": "VLAN", "severity": "High", "title": "Voice VLAN not permitted", "symptom": "An IP phone cannot register through the switch uplink.", "evidence": "show interfaces trunk: the voice VLAN 20 is missing from the uplink allowed list.", "fault": "The voice VLAN is not permitted across the trunk.", "osi": "Layer 2", "concept": "Voice VLAN / trunking", "next": "show interfaces trunk", "fix": "Permit the voice VLAN on the uplink and verify phone VLAN mapping.", "check": "Voice VLAN 20 is absent from the trunk allowed VLAN list."}, {"id": "NS-06", "issue": "Gateway", "severity": "High", "title": "Incorrect default gateway", "symptom": "PC can communicate on its local subnet but cannot reach remote networks.", "evidence": "ipconfig shows gateway 192.168.10.254, while the SVI for the subnet is 192.168.10.1.", "fault": "The endpoint has an incorrect default gateway.", "osi": "Layer 3", "concept": "Default gateway", "next": "ipconfig /all", "fix": "Set the host gateway to the correct SVI/router address and retest.", "check": "Configured gateway does not match the subnet gateway."}, {"id": "NS-07", "issue": "Gateway", "severity": "High", "title": "SVI interface down", "symptom": "Hosts in a VLAN have valid addresses but cannot reach their gateway.", "evidence": "show ip interface brief: Vlan20 is administratively down.", "fault": "The VLAN SVI is shut down.", "osi": "Layer 3", "concept": "SVI", "next": "show ip interface brief", "fix": "Enable the SVI and verify its IP address and VLAN status.", "check": "Vlan20 is administratively down."}, {"id": "NS-08", "issue": "Gateway", "severity": "Medium", "title": "Wrong subnet mask", "symptom": "A host treats a nearby remote address as local and communication fails.", "evidence": "Host uses /25 while the intended subnet is /24.", "fault": "The host has an incorrect subnet mask.", "osi": "Layer 3", "concept": "IPv4 subnetting", "next": "ipconfig /all", "fix": "Correct the subnet mask and verify the host routing decision.", "check": "Configured mask differs from the expected subnet mask."}, {"id": "NS-09", "issue": "DHCP", "severity": "High", "title": "DHCP pool has no free addresses", "symptom": "New clients receive APIPA addresses instead of valid network addresses.", "evidence": "show ip dhcp pool: allocated addresses equal the pool's usable range.", "fault": "The DHCP pool is exhausted.", "osi": "Layer 3", "concept": "DHCP address allocation", "next": "show ip dhcp pool", "fix": "Expand the DHCP scope or free unused leases after verification.", "check": "Used DHCP addresses equal the available pool capacity."}, {"id": "NS-10", "issue": "DHCP", "severity": "High", "title": "DHCP relay missing", "symptom": "Clients in a remote VLAN do not receive DHCP addresses.", "evidence": "show running-config interface Vlan30: no ip helper-address is configured.", "fault": "The DHCP relay configuration is missing on the client VLAN interface.", "osi": "Layer 3", "concept": "DHCP relay", "next": "show running-config interface Vlan30", "fix": "Configure the correct ip helper-address on the VLAN interface.", "check": "No DHCP relay/helper address is present."}, {"id": "NS-11", "issue": "DHCP", "severity": "Medium", "title": "Incorrect DHCP network", "symptom": "Clients receive addresses from the wrong subnet.", "evidence": "DHCP pool network is 192.168.40.0/24, but clients belong to 192.168.50.0/24.", "fault": "The DHCP pool network does not match the client subnet.", "osi": "Layer 3", "concept": "DHCP scope", "next": "show running-config | section dhcp", "fix": "Correct the DHCP network statement and verify exclusions.", "check": "DHCP pool network differs from the client VLAN subnet."}, {"id": "NS-12", "issue": "DHCP", "severity": "Medium", "title": "Excluded gateway range missing", "symptom": "A client occasionally receives an address reserved for infrastructure.", "evidence": "show running-config | section dhcp: gateway addresses are not excluded from the pool.", "fault": "Infrastructure addresses were not excluded from DHCP allocation.", "osi": "Layer 3", "concept": "DHCP exclusions", "next": "show running-config | section dhcp", "fix": "Exclude gateway and infrastructure addresses from the DHCP pool.", "check": "Reserved infrastructure addresses are inside the allocatable range."}, {"id": "NS-13", "issue": "DNS", "severity": "Medium", "title": "Incorrect DNS server", "symptom": "Users can ping an IP address but cannot resolve the application hostname.", "evidence": "ipconfig /all: DNS server is 192.168.1.254, while the lab DNS server is 192.168.1.10.", "fault": "Clients are configured with the wrong DNS server.", "osi": "Layer 7", "concept": "DNS resolution", "next": "ipconfig /all", "fix": "Configure the correct DNS server and retry name resolution.", "check": "Configured DNS address differs from the lab DNS server."}, {"id": "NS-14", "issue": "DNS", "severity": "Medium", "title": "DNS service unreachable", "symptom": "Hostname resolution fails for all clients.", "evidence": "Ping to the DNS server fails and the DNS server interface is shown down.", "fault": "The DNS server is unreachable because its network interface is down.", "osi": "Layer 3/7", "concept": "DNS reachability", "next": "show ip interface brief", "fix": "Restore server interface connectivity, then verify DNS resolution.", "check": "DNS server reachability test fails."}, {"id": "NS-15", "issue": "DNS", "severity": "Low", "title": "Wrong DNS record", "symptom": "The application hostname resolves, but to the wrong server IP.", "evidence": "nslookup app.local returns 10.0.0.20 while the application server is 10.0.0.30.", "fault": "The DNS record contains an incorrect address.", "osi": "Layer 7", "concept": "DNS records", "next": "nslookup app.local", "fix": "Correct the DNS A record and verify the response.", "check": "Resolved IP differs from the known application server address."}, {"id": "NS-16", "issue": "Routing", "severity": "High", "title": "Missing static route", "symptom": "A remote LAN is unreachable from the router.", "evidence": "show ip route: no route exists for 10.20.0.0/24.", "fault": "The router is missing a route to the remote LAN.", "osi": "Layer 3", "concept": "Static routing", "next": "show ip route", "fix": "Add or restore the appropriate route after verifying the next hop.", "check": "Destination network is absent from the routing table."}, {"id": "NS-17", "issue": "Routing", "severity": "High", "title": "Incorrect next hop", "symptom": "Traffic is routed toward the wrong router and the destination remains unreachable.", "evidence": "show ip route 10.30.0.0: next hop is 192.168.12.99, but the connected neighbor is 192.168.12.2.", "fault": "The route points to an incorrect next-hop address.", "osi": "Layer 3", "concept": "Next-hop routing", "next": "show ip route 10.30.0.0", "fix": "Correct the next-hop address and verify route installation.", "check": "Configured next hop does not match the connected neighbor."}, {"id": "NS-18", "issue": "Routing", "severity": "High", "title": "OSPF network not advertised", "symptom": "An OSPF neighbor is up, but one LAN is missing from the remote routing table.", "evidence": "show ip route ospf: the LAN prefix is absent; OSPF configuration does not include the LAN interface.", "fault": "The LAN is not being advertised into OSPF.", "osi": "Layer 3", "concept": "OSPF advertisement", "next": "show ip ospf interface brief", "fix": "Include the correct LAN interface/network in OSPF and verify learned routes.", "check": "Expected LAN prefix is absent from OSPF-learned routes."}, {"id": "NS-19", "issue": "Routing", "severity": "Medium", "title": "Default route missing", "symptom": "Internal networks work but Internet-bound traffic fails.", "evidence": "show ip route: no 0.0.0.0/0 default route is present.", "fault": "The router has no default route for unknown destinations.", "osi": "Layer 3", "concept": "Default routing", "next": "show ip route", "fix": "Configure the correct default route and verify the upstream gateway.", "check": "Routing table contains no default route."}, {"id": "NS-20", "issue": "Routing", "severity": "High", "title": "Interface administratively down", "symptom": "A directly connected network is unreachable.", "evidence": "show ip interface brief: Gi0/1 is administratively down.", "fault": "The routed interface is shut down.", "osi": "Layer 3", "concept": "Interface state", "next": "show ip interface brief", "fix": "Enable the interface and verify line protocol and addressing.", "check": "Gi0/1 is administratively down."}, {"id": "NS-21", "issue": "ACL", "severity": "High", "title": "ACL blocks required service", "symptom": "Clients can reach the server IP but HTTPS connections fail.", "evidence": "show access-lists: an extended ACL denies TCP traffic to destination port 443.", "fault": "The ACL denies required HTTPS traffic.", "osi": "Layer 4", "concept": "Extended ACL", "next": "show access-lists", "fix": "Review ACL order and permit required HTTPS traffic if policy allows.", "check": "ACL contains a deny rule matching TCP destination port 443."}, {"id": "NS-22", "issue": "ACL", "severity": "High", "title": "ACL applied on wrong interface", "symptom": "Traffic is unexpectedly blocked before reaching its destination.", "evidence": "show ip interface: restrictive ACL is applied inbound on the client VLAN interface.", "fault": "The ACL is applied in an unintended direction/interface.", "osi": "Layer 3/4", "concept": "ACL placement", "next": "show ip interface", "fix": "Validate policy and apply the ACL on the intended interface/direction.", "check": "ACL attachment does not match the intended traffic path."}, {"id": "NS-23", "issue": "ACL", "severity": "Medium", "title": "Implicit deny blocks traffic", "symptom": "Only explicitly permitted traffic works; other traffic is dropped.", "evidence": "show access-lists: ACL ends without a permit statement for the required subnet.", "fault": "Traffic reaches the implicit deny at the end of the ACL.", "osi": "Layer 3/4", "concept": "Implicit deny", "next": "show access-lists", "fix": "Add an appropriate permit statement after validating security policy.", "check": "Required traffic has no matching permit rule."}, {"id": "NS-24", "issue": "NAT", "severity": "High", "title": "Inside interface not marked for NAT", "symptom": "Inside hosts cannot be translated for external access.", "evidence": "show running-config interface Gi0/0: the inside interface lacks ip nat inside.", "fault": "The inside interface is not designated for NAT.", "osi": "Layer 3", "concept": "NAT inside/outside", "next": "show running-config interface Gi0/0", "fix": "Verify and configure the correct NAT inside/outside roles.", "check": "Expected inside interface lacks NAT inside designation."}, {"id": "NS-25", "issue": "NAT", "severity": "High", "title": "NAT ACL does not match LAN", "symptom": "NAT translations are not created for client traffic.", "evidence": "show access-lists: NAT ACL permits 192.168.20.0/24, but the LAN is 192.168.30.0/24.", "fault": "The NAT matching ACL does not include the actual inside subnet.", "osi": "Layer 3", "concept": "PAT/NAT ACL", "next": "show access-lists", "fix": "Correct the NAT ACL to match the intended inside subnet.", "check": "NAT ACL subnet differs from the actual LAN."}, {"id": "NS-26", "issue": "NAT", "severity": "Medium", "title": "No NAT translations", "symptom": "Inside clients reach the NAT router but external sessions fail.", "evidence": "show ip nat translations returns no entries after a client generates traffic.", "fault": "No translation is being created for the client traffic.", "osi": "Layer 3", "concept": "NAT translation", "next": "show ip nat translations", "fix": "Verify NAT interfaces, matching ACL, and overload configuration.", "check": "Translation table remains empty during a known NAT attempt."}, {"id": "NS-27", "issue": "NAT", "severity": "Medium", "title": "Outside interface misconfigured", "symptom": "NAT is configured but external traffic is not translated correctly.", "evidence": "show running-config interface Gi0/1: external interface is marked ip nat inside.", "fault": "The NAT inside/outside role is reversed.", "osi": "Layer 3", "concept": "NAT interface roles", "next": "show running-config interface Gi0/1", "fix": "Correct the NAT role on the external interface and verify translations.", "check": "External-facing interface is marked as NAT inside."}, {"id": "NS-28", "issue": "Wireless", "severity": "High", "title": "Wireless VLAN mapping incorrect", "symptom": "Wi-Fi clients associate successfully but cannot reach the expected subnet.", "evidence": "AP/controller maps the SSID to VLAN 50, while the wireless client network is VLAN 60.", "fault": "The SSID is mapped to the wrong VLAN.", "osi": "Layer 2", "concept": "SSID to VLAN mapping", "next": "show vlan brief / inspect SSID VLAN mapping", "fix": "Map the SSID to the intended client VLAN and verify trunking.", "check": "SSID VLAN does not match the expected wireless client VLAN."}, {"id": "NS-29", "issue": "Wireless", "severity": "High", "title": "Guest network reaches internal server", "symptom": "Guest Wi-Fi clients can access an internal application server.", "evidence": "Guest clients are on VLAN 70, but the isolation ACL has no deny rule for the internal server subnet.", "fault": "Guest isolation policy is missing or incomplete.", "osi": "Layer 3/4", "concept": "Wireless isolation / ACL", "next": "show access-lists", "fix": "Apply the approved guest isolation policy and verify intended destinations only.", "check": "Guest traffic has no matching isolation deny rule for internal resources."}, {"id": "NS-30", "issue": "Wireless", "severity": "Medium", "title": "DHCP unavailable for wireless clients", "symptom": "Wireless clients associate but receive no IP address.", "evidence": "SSID maps to VLAN 80; the VLAN interface has no DHCP relay and the DHCP server is on another subnet.", "fault": "Wireless client VLAN lacks DHCP relay configuration.", "osi": "Layer 3", "concept": "Wireless DHCP", "next": "show running-config interface Vlan80", "fix": "Configure the correct DHCP relay for the wireless VLAN and verify address assignment.", "check": "Wireless VLAN interface has no DHCP helper/relay."}, {"id": "NS-31", "issue": "Wireless", "severity": "Medium", "title": "Access point uplink not carrying client VLAN", "symptom": "Clients connect to the SSID but cannot obtain network service.", "evidence": "show interfaces trunk: the AP uplink does not allow the client VLAN.", "fault": "The wireless client VLAN is missing from the AP uplink trunk.", "osi": "Layer 2", "concept": "Wireless trunking", "next": "show interfaces trunk", "fix": "Permit the wireless client VLAN on the AP uplink after verifying the intended topology.", "check": "Client VLAN is absent from the AP uplink allowed VLAN list."}];
let selectedId = CASES[0].id;
let currentDiagnosis = null;
const reviews = JSON.parse(localStorage.getItem('netsage_reviews') || '{}');
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderCaseList(filter = '') {
    const q = filter.toLowerCase();

    const list = CASES.filter(c =>
        `${c.id} ${c.title} ${c.issue} ${c.symptom}`
            .toLowerCase()
            .includes(q)
    );

    $('#caseList').innerHTML = list.map(c => `
        <div class="case-item ${c.id === selectedId ? 'active' : ''}" data-id="${c.id}">
            <div class="case-top">
                <span class="case-id">${c.id}</span>
                <span class="tag">${c.issue}</span>
            </div>
            <div class="case-title">${esc(c.title)}</div>
        </div>
    `).join('') || '<div class="empty">No matching cases.</div>';

    document.querySelectorAll('.case-item').forEach(el => {
        el.onclick = () => {
            selectedId = el.dataset.id;
            renderCaseList($('#search').value);
            renderCaseDetail();
            $('#result').classList.add('hidden');
        };
    });
}
function renderCaseDetail(){
  const c=CASES.find(x=>x.id===selectedId);
  $('#caseDetail').innerHTML=`<div class="detail-header"><div><div class="panel-kicker">${c.id} · ${c.issue}</div><h2>${esc(c.title)}</h2></div><div class="badge">${c.severity} severity</div></div>
  <div class="field"><label>SYMPTOM</label><p>${esc(c.symptom)}</p></div>
  <div class="field"><label>CISCO / LAB EVIDENCE</label><div class="evidence">${esc(c.evidence)}</div></div>`;
}
function diagnose(c){
  return {root_cause:c.fault,confidence:c.severity==='High'?'High':'Medium',osi:c.osi,evidence:[c.evidence,`Deterministic check: ${c.check}`],next:c.next,fix:[c.fix,'Verify the change with the relevant show command before accepting the result.']};
}
function renderDiagnosis(){
  const c=CASES.find(x=>x.id===selectedId); currentDiagnosis=diagnose(c);
  $('#result').classList.remove('hidden');
  $('#result').innerHTML=`<div class="panel-kicker">DIAGNOSIS RESULT · DETERMINISTIC DEMO ENGINE</div>
  <div class="result-grid"><div class="metric"><small>ROOT CAUSE</small><b>${esc(currentDiagnosis.root_cause)}</b></div>
  <div class="metric"><small>CONFIDENCE</small><b>${currentDiagnosis.confidence}</b></div><div class="metric"><small>OSI LAYER</small><b>${esc(currentDiagnosis.osi)}</b></div></div>
  <div class="result-section"><h3>Evidence used</h3><div class="evidence">${currentDiagnosis.evidence.map(esc).join('\n\n')}</div></div>
  <div class="result-section"><h3>Next diagnostic command</h3><div class="evidence">${esc(currentDiagnosis.next)}</div></div>
  <div class="result-section"><h3>Recommended fix path</h3><ol class="fixes">${currentDiagnosis.fix.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>
  <div class="safety">🛡️ Human review required. This GitHub Pages demo does not execute network configuration changes and does not expose a Gemini API key.</div>`;
  updateStats();
}
function updateStats(){
  const vals=Object.values(reviews); $('#reviewedCount').textContent=vals.length;
  const accepted=vals.filter(x=>x.status==='Accepted').length;
  $('#agreement').textContent=vals.length?Math.round(accepted/vals.length*100)+'%':'—';
}
function saveReview(status,note){
  const c=CASES.find(x=>x.id===selectedId);
  reviews[c.id]={status,note:note||'',diagnosis:currentDiagnosis||diagnose(c)};
  localStorage.setItem('netsage_reviews',JSON.stringify(reviews)); renderReview(); updateStats(); renderAnalytics();
}
function renderReview(){
  const entries=Object.entries(reviews);
  $('#reviewList').innerHTML=entries.length?entries.map(([id,r])=>{
    const c=CASES.find(x=>x.id===id);
    return `<div class="review-row" data-id="${id}"><span class="status ${r.status.toLowerCase()}">${r.status}</span><strong>${id} · ${esc(c.title)}</strong><small>${esc(r.note||'No reviewer note')}</small></div>`;
  }).join(''):'<div class="empty">No review records yet.<br>Run a diagnosis and save a decision.</div>';
  document.querySelectorAll('.review-row').forEach(el=>el.onclick=()=>openReview(el.dataset.id));
}
function openReview(id=selectedId){
  selectedId=id; const c=CASES.find(x=>x.id===id); const d=reviews[id]?.diagnosis||diagnose(c); currentDiagnosis=d;
  $('#reviewEditor').innerHTML=`<div class="panel-kicker">${id} · REVIEW</div><h2>${esc(c.title)}</h2>
  <div class="field"><label>PROPOSED ROOT CAUSE</label><p>${esc(d.root_cause)}</p></div>
  <div class="field"><label>REVIEWER NOTE</label><div class="review-form"><textarea id="reviewNote" placeholder="Explain why you accepted, edited or rejected this recommendation.">${esc(reviews[id]?.note||'')}</textarea></div></div>
  <div class="review-actions"><button class="accept" id="acceptBtn">✓ Accept</button><button class="edit" id="editBtn">✎ Edit</button><button class="reject" id="rejectBtn">× Reject</button></div>`;
  $('#acceptBtn').onclick=()=>saveReview('Accepted',$('#reviewNote').value);
  $('#editBtn').onclick=()=>saveReview('Edited',$('#reviewNote').value||'Human reviewer edited the recommendation.');
  $('#rejectBtn').onclick=()=>saveReview('Rejected',$('#reviewNote').value||'Human reviewer rejected the recommendation.');
}
function renderAnalytics(){
  const counts={}; CASES.forEach(c=>counts[c.issue]=(counts[c.issue]||0)+1);
  const max=Math.max(...Object.values(counts));
  $('#issueBars').innerHTML=Object.entries(counts).map(([k,v])=>`<div class="bar"><div class="bar-head"><span>${k}</span><b>${v}</b></div><div class="track"><div class="fill" style="width:${v/max*100}%"></div></div></div>`).join('');
  const statuses=['Accepted','Edited','Rejected']; const total=Object.keys(reviews).length;
  $('#reviewBars').innerHTML=statuses.map(s=>{const v=Object.values(reviews).filter(x=>x.status===s).length;return `<div class="bar"><div class="bar-head"><span>${s}</span><b>${v}</b></div><div class="track"><div class="fill" style="width:${total?v/total*100:0}%"></div></div></div>`}).join('');
}

document.querySelectorAll('.nav').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav').forEach(x =>
      x.classList.remove('active')
    );
    btn.classList.add('active');

    document.querySelectorAll('.view').forEach(x =>
      x.classList.remove('active')
    );
    $(`#${btn.dataset.view}`).classList.add('active');

    if (btn.dataset.view === 'review') {
      renderReview();

      if (Object.keys(reviews).length > 0) {
        openReview(Object.keys(reviews)[0]);
      } else {
        openReview(selectedId);
      }

    if (btn.dataset.view === 'analytics') {
      renderAnalytics();
    }
  };
});

$('#search').oninput = e => renderCaseList(e.target.value);
$('#runBtn').onclick = renderDiagnosis;

$('#search').oninput=e=>renderCaseList(e.target.value);
$('#runBtn').onclick=renderDiagnosis;
$('#caseCount').textContent=CASES.length; $('#categoryCount').textContent=new Set(CASES.map(c=>c.issue)).size;
renderCaseList(); renderCaseDetail(); updateStats(); renderAnalytics();

