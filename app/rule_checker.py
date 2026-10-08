import ipaddress


def check_case(case):
    """Deterministic checks for common lab configuration mistakes."""
    text = " ".join(str(case.get(k, "")) for k in ("symptom", "show_outputs", "topology_note")).lower()
    findings = []

    if "duplicate" in text or "same ip" in text:
        findings.append("Possible duplicate IP address detected")
    if "mask" in text and ("wrong" in text or "mismatch" in text or "255.255.255.0" in text):
        findings.append("Check subnet mask consistency")
    if "gateway" in text and ("mismatch" in text or "wrong" in text or "unreachable" in text):
        findings.append("Check default gateway and SVI/router interface")
    if "interface down" in text or "administratively down" in text:
        findings.append("Interface may be shutdown/down")
    if "vlan" in text and ("missing" in text or "not allowed" in text or "wrong" in text):
        findings.append("Check VLAN existence and trunk allowance")
    if "dhcp" in text and ("no address" in text or "failed" in text or "pool" in text):
        findings.append("Check DHCP pool, scope and relay configuration")
    if "dns" in text and ("fail" in text or "cannot resolve" in text or "server" in text):
        findings.append("Check DNS server address and reachability")
    if "route" in text and ("missing" in text or "no route" in text or "routing" in text):
        findings.append("Check routing table and next-hop reachability")
    if "acl" in text and ("deny" in text or "blocked" in text or "permit" in text):
        findings.append("Check ACL order and interface direction")
    if "nat" in text and ("translation" in text or "inside" in text or "outside" in text):
        findings.append("Check NAT inside/outside roles and translation entries")
    if "wireless" in text or "wi-fi" in text or "wifi" in text:
        findings.append("Check SSID/VLAN mapping, isolation and ACL rules")

    return findings
