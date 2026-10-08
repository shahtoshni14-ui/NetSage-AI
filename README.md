# 🌐 NetSage AI

## AI-Assisted Cisco Network Troubleshooting with Human-in-the-Loop Validation

> **AI proposes. Human reviews.**

NetSage AI is an **Applied AI + Network Troubleshooting** web application designed to assist students and learners in diagnosing Cisco-style networking lab incidents.

The system takes network symptoms and Cisco `show` command evidence, analyzes the available information, identifies a probable root cause, recommends the next diagnostic command, and provides a suggested remediation path.

Instead of allowing AI to make configuration changes automatically, NetSage AI places a **Human Review Gate** between diagnosis and remediation.

# 🎯 Problem Statement

Network troubleshooting often requires connecting multiple pieces of technical evidence:

- Network symptoms
- VLAN configuration
- IP addressing
- Default gateways
- DHCP configuration
- DNS behavior
- Routing information
- ACL rules
- NAT configuration
- Wireless configuration
- Cisco `show` command outputs

For students and beginners, identifying the actual root cause and deciding which diagnostic command to run next can be difficult.

Generative AI can help with troubleshooting, but relying on AI alone can lead to incorrect assumptions or unsafe recommendations.

### NetSage AI addresses this by combining:

**Evidence + Deterministic Checks + AI Assistance + Human Review**

# 💡 Solution

NetSage AI provides a structured troubleshooting workflow:

```text
Network Incident
       ↓
Symptoms + Cisco Evidence
       ↓
Python Deterministic Checks
       ↓
AI-Assisted Diagnosis
       ↓
Root Cause + Confidence
       ↓
Next Diagnostic Command
       ↓
Recommended Fix Path
       ↓
Human Review Gate
       ↓
Accept / Edit / Reject
