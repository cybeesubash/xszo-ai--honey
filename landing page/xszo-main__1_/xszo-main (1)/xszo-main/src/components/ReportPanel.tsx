import React, { useState } from 'react';
import { FileText, Copy, Check, Download, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { AttackEvent } from '../types.js';
import { jsPDF } from 'jspdf';

interface ReportPanelProps {
  recentAttacks: AttackEvent[];
  activeAttack: AttackEvent | null;
}

export default function ReportPanel({ recentAttacks, activeAttack }: ReportPanelProps) {
  const [reportType, setReportType] = useState<'executive' | 'signatures' | 'mitre'>('signatures');
  const [copiedRule, setCopiedRule] = useState<string | null>(null);

  // Focus on the selected attack or fall back to the newest attack
  const selectedAttack = activeAttack || (recentAttacks.length > 0 ? recentAttacks[0] : null);

  const handleCopy = (text: string, ruleName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(ruleName);
    setTimeout(() => setCopiedRule(null), 2000);
  };

  // Compile full text HTML report for export download
  const downloadReport = (format: 'json' | 'html' | 'csv') => {
    if (!selectedAttack) return;
    
    let content = '';
    let filename = `CYBER_EYE_INCIDENT_${selectedAttack.id}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(selectedAttack, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = 'ID,Timestamp,Sensor,SourceIP,Country,Port,Protocol,AttackType,Severity,Score\n';
      const row = `"${selectedAttack.id}","${selectedAttack.timestamp}","${selectedAttack.deviceName}","${selectedAttack.sourceIP}","${selectedAttack.country}",${selectedAttack.destPort},"${selectedAttack.protocol}","${selectedAttack.analysis?.attackType || 'Scan'}",${selectedAttack.analysis?.severity || 'Medium'},${selectedAttack.analysis?.threatScore || 50}\n`;
      content = headers + row;
      filename += '.csv';
      mimeType = 'text/csv';
    } else if (format === 'html') {
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CYBER-EYE AI Security Report - ${selectedAttack.id}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
        .header { background: #0c1530; color: #fff; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .badge-critical { background: #fecaca; color: #991b1b; }
        .badge-high { background: #ffedd5; color: #9a3412; }
        .badge-medium { background: #dbeafe; color: #1e40af; }
        .pre { background: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; overflow-x: auto; border: 1px solid #e5e7eb; }
        h1, h2, h3 { color: #111827; }
        .header h1, .header h3 { color: #fff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CYBER-EYE INCIDENT REPORT</h1>
        <h3>Incident ID: ${selectedAttack.id}</h3>
        <p>Generated At: ${new Date().toISOString()}</p>
    </div>
    
    <div class="section">
        <h2>Executive Summary</h2>
        <p>${selectedAttack.analysis?.summary || 'Scanning probe identified'}</p>
        <p><strong>Incident Analysis:</strong> ${selectedAttack.analysis?.incidentSummary || 'No technical assessment compiled.'}</p>
    </div>

    <div class="section">
        <h2>Intrusion Details</h2>
        <div class="grid">
            <div>
                <p><strong>Source IP Address:</strong> ${selectedAttack.sourceIP}</p>
                <p><strong>Country of Origin:</strong> ${selectedAttack.country} (${selectedAttack.countryCode})</p>
                <p><strong>Sensor Node Name:</strong> ${selectedAttack.deviceName}</p>
            </div>
            <div>
                <p><strong>Target Ingress Port:</strong> ${selectedAttack.destPort} / ${selectedAttack.protocol}</p>
                <p><strong>AI Threat Score:</strong> ${selectedAttack.analysis?.threatScore || 50} / 100</p>
                <p><strong>Security Severity:</strong> <span class="badge badge-${(selectedAttack.analysis?.severity || 'Medium').toLowerCase()}">${selectedAttack.analysis?.severity || 'Medium'}</span></p>
            </div>
        </div>
        <p><strong>Captured Buffer Dump Payload:</strong></p>
        <div class="pre">${selectedAttack.payload}</div>
    </div>

    <div class="section">
        <h2>MITRE ATT&CK & Defense Actions</h2>
        <p><strong>Mapped MITRE Technique:</strong> ${selectedAttack.analysis?.mitreAttack || 'T1046'}</p>
        <p><strong>Firewall Isolation Command:</strong></p>
        <div class="pre">${selectedAttack.analysis?.firewallRule || 'N/A'}</div>
    </div>
    
    <div class="section">
        <h2>Remediation Recommendations</h2>
        <ul>
            ${(selectedAttack.analysis?.recommendations || []).map(r => `<li>${r}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
      `;
      filename += '.html';
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDFReport = () => {
    if (!selectedAttack) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 15;
    const pageHeight = 297;
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const checkPageOffset = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        y = 15;
        // Draw miniature header on new page
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`CYBER-EYE INCIDENT REPORT - ID: ${selectedAttack.id.substring(0, 16)}`, margin, y);
        doc.line(margin, y + 2, margin + contentWidth, y + 2);
        y += 10;
      }
    };

    // --- DRAW PREMIUM HEADER ---
    // Background banner (Deep Navy)
    doc.setFillColor(12, 21, 48);
    doc.rect(margin, y, contentWidth, 35, 'F');
    
    // Header title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("CYBER-EYE SECURITY INCIDENT REPORT", margin + 6, y + 10);
    
    // Header metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // light blue-gray
    doc.text(`INCIDENT ID: ${selectedAttack.id}`, margin + 6, y + 17);
    doc.text(`GENERATED AT: ${new Date().toLocaleString()}`, margin + 6, y + 22);
    doc.text(`SENSOR NODE: ${selectedAttack.deviceName}`, margin + 6, y + 27);
    
    // Severity / Score Tag inside Header (colored box)
    const severity = selectedAttack.analysis?.severity || 'Medium';
    let sevColor = [59, 130, 246]; // Blue
    if (severity === 'High') sevColor = [249, 115, 22]; // Orange
    if (severity === 'Critical') sevColor = [239, 68, 68]; // Red
    
    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.rect(margin + contentWidth - 42, y + 8, 36, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text("THREAT SEVERITY", margin + contentWidth - 39, y + 13);
    doc.setFontSize(10.5);
    doc.text(severity.toUpperCase(), margin + contentWidth - 39, y + 21);

    y += 42;

    // --- SECTION 1: EXECUTIVE SUMMARY ---
    checkPageOffset(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(12, 21, 48);
    doc.text("1. EXECUTIVE SUMMARY", margin, y);
    doc.line(margin, y + 2, margin + contentWidth, y + 2);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700
    
    const summaryText = selectedAttack.analysis?.summary || 'Scanning intrusion probe identified by sensor matrix.';
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, margin, y);
    y += (splitSummary.length * 5) + 4;

    // Detailed incident summary if available
    if (selectedAttack.analysis?.incidentSummary) {
      checkPageOffset(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Technical Assessment:", margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitTech = doc.splitTextToSize(selectedAttack.analysis.incidentSummary, contentWidth);
      doc.text(splitTech, margin, y);
      y += (splitTech.length * 5) + 6;
    }

    // --- SECTION 2: METADATA GRID ---
    checkPageOffset(45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(12, 21, 48);
    doc.text("2. NETWORK & THREAT ATTRIBUTES", margin, y);
    doc.line(margin, y + 2, margin + contentWidth, y + 2);
    y += 8;

    // Grid details
    doc.setFillColor(248, 250, 252); // light slate background
    doc.rect(margin, y, contentWidth, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 30, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    // Left column labels
    doc.text("Source IP Address:", margin + 5, y + 6);
    doc.text("Country of Origin:", margin + 5, y + 12);
    doc.text("Target Port / Protocol:", margin + 5, y + 18);
    doc.text("Capture Timestamp:", margin + 5, y + 24);

    // Left column values
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(selectedAttack.sourceIP, margin + 45, y + 6);
    doc.text(`${selectedAttack.country} (${selectedAttack.countryCode})`, margin + 45, y + 12);
    doc.text(`${selectedAttack.destPort} / ${selectedAttack.protocol}`, margin + 45, y + 18);
    doc.text(new Date(selectedAttack.timestamp).toLocaleString(), margin + 45, y + 24);

    // Right column labels
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text("AI Threat Score:", margin + 105, y + 6);
    doc.text("Associated CVE:", margin + 105, y + 12);
    doc.text("MITRE Technique:", margin + 105, y + 18);
    doc.text("Defense Action:", margin + 105, y + 24);

    // Right column values
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${selectedAttack.analysis?.threatScore || 50} / 100`, margin + 140, y + 6);
    doc.text(selectedAttack.analysis?.possibleCve || 'N/A', margin + 140, y + 12);
    doc.text(selectedAttack.analysis?.mitreAttack || 'T1046', margin + 140, y + 18);
    doc.text("IP ACL isolation", margin + 140, y + 24);

    y += 38;

    // --- SECTION 3: DEEP RECOMMENDATIONS ---
    const recommendations = selectedAttack.analysis?.recommendations || [];
    if (recommendations.length > 0) {
      checkPageOffset(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(12, 21, 48);
      doc.text("3. MITIGATION RECOMMENDATIONS", margin, y);
      doc.line(margin, y + 2, margin + contentWidth, y + 2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      recommendations.forEach((rec, idx) => {
        checkPageOffset(15);
        const splitRec = doc.splitTextToSize(`${idx + 1}. ${rec}`, contentWidth - 4);
        doc.text(splitRec, margin + 2, y);
        y += (splitRec.length * 4.5) + 3;
      });
      y += 4;
    }

    // --- SECTION 4: CAPTURED BUFFER RAW PAYLOAD ---
    if (selectedAttack.payload) {
      checkPageOffset(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(12, 21, 48);
      doc.text("4. CAPTURED NETWORK TELEMETRY PAYLOAD", margin, y);
      doc.line(margin, y + 2, margin + contentWidth, y + 2);
      y += 8;

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Raw hex / payload dump can be long, so slice or handle neatly
      const payloadLines = doc.splitTextToSize(selectedAttack.payload, contentWidth - 8);
      
      // Box background
      const boxHeight = (payloadLines.length * 3.8) + 6;
      checkPageOffset(Math.min(boxHeight, 100)); // check page offset, cap at 100mm to not force page break if very large

      // If we are about to draw a very large payload, let's chunk it page by page
      doc.setFillColor(241, 245, 249); // light blue-gray
      doc.rect(margin, y, contentWidth, Math.min(boxHeight, pageHeight - y - 10), 'F');
      
      let payloadY = y + 4;
      for (let i = 0; i < payloadLines.length; i++) {
        if (payloadY > pageHeight - 15) {
          doc.addPage();
          y = 15;
          payloadY = 19;
          doc.setFillColor(241, 245, 249);
          // Redraw box background on new page
          const remainingLines = payloadLines.length - i;
          doc.rect(margin, y, contentWidth, Math.min(remainingLines * 3.8 + 6, pageHeight - y - 10), 'F');
        }
        doc.text(payloadLines[i], margin + 4, payloadY);
        payloadY += 3.8;
      }
      y = payloadY + 8;
    }

    // --- FOOTER ON ALL PAGES ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("CLASSIFICATION: CONFIDENTIAL // SOC INTERNAL USE ONLY", margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth - 20, pageHeight - 8);
    }

    doc.save(`CYBER_EYE_INCIDENT_${selectedAttack.id.substring(0, 8)}.pdf`);
  };

  return (
    <div className="bg-[#090b1e]/60 border border-blue-950 rounded-xl p-5" id="report-panel-container">
      {/* Tab select Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-blue-950 pb-4 mb-5" id="report-header">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Intelligence Reporter</h3>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#040612] p-1 rounded-lg border border-blue-950 text-xs font-mono" id="report-tabs">
          <button
            onClick={() => setReportType('signatures')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${reportType === 'signatures' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            IDS/YARA Rules
          </button>
          <button
            onClick={() => setReportType('executive')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${reportType === 'executive' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Incident Report
          </button>
          <button
            onClick={() => setReportType('mitre')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${reportType === 'mitre' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            MITRE Mapping
          </button>
        </div>
      </div>

      {!selectedAttack ? (
        <div className="text-center py-10 font-mono text-xs text-gray-500">
          No active attack events captured. System is awaiting telemetry packets.
        </div>
      ) : (
        <div className="space-y-5" id="report-body">
          {/* 1. COMPILATION SIGNATURES MODULE */}
          {reportType === 'signatures' && (
            <div className="space-y-4" id="report-signatures-module">
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs font-mono text-gray-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>AI compiler has drafted proactive defensive definitions tailored to block future occurrences of this specific payload pattern.</span>
              </div>

              {/* Rules blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="rules-boxes-grid">
                {/* Rule: Firewall command */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-bold uppercase tracking-wider">Linux firewall block</span>
                    <button 
                      onClick={() => handleCopy(selectedAttack.analysis?.firewallRule || '', 'firewall')}
                      className="text-gray-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRule === 'firewall' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRule === 'firewall' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#050611] border border-blue-950 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto select-all">
                    {selectedAttack.analysis?.firewallRule}
                  </pre>
                </div>

                {/* Rule: YARA Signatures */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-bold uppercase tracking-wider">YARA Memory Signature</span>
                    <button 
                      onClick={() => handleCopy(selectedAttack.analysis?.yaraRule || '', 'yara')}
                      className="text-gray-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRule === 'yara' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRule === 'yara' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#050611] border border-blue-950 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto select-all h-[90px] overflow-y-auto">
                    {selectedAttack.analysis?.yaraRule}
                  </pre>
                </div>

                {/* Rule: Snort Rule */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-bold uppercase tracking-wider">Snort IDS Signature</span>
                    <button 
                      onClick={() => handleCopy(selectedAttack.analysis?.snortRule || '', 'snort')}
                      className="text-gray-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRule === 'snort' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRule === 'snort' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#050611] border border-blue-950 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto select-all">
                    {selectedAttack.analysis?.snortRule}
                  </pre>
                </div>

                {/* Rule: Suricata Rule */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-bold uppercase tracking-wider">Suricata NIDS Block</span>
                    <button 
                      onClick={() => handleCopy(selectedAttack.analysis?.suricataRule || '', 'suricata')}
                      className="text-gray-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRule === 'suricata' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRule === 'suricata' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#050611] border border-blue-950 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto select-all">
                    {selectedAttack.analysis?.suricataRule}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXECUTIVE SECURITY REPORT MODULE */}
          {reportType === 'executive' && (
            <div className="space-y-4 font-mono text-xs" id="report-executive-module">
              <div className="flex justify-between items-center bg-[#050611] p-3 border border-blue-950 rounded-lg">
                <div className="flex gap-4">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">Threat Score</span>
                    <span className="text-red-500 font-bold text-lg">{selectedAttack.analysis?.threatScore || 50}/100</span>
                  </div>
                  <div className="border-l border-blue-950 pl-4">
                    <span className="text-gray-500 text-[10px] block uppercase">Associated CVE</span>
                    <span className="text-white font-bold text-sm">{selectedAttack.analysis?.possibleCve || 'N/A'}</span>
                  </div>
                  <div className="border-l border-blue-950 pl-4">
                    <span className="text-gray-500 text-[10px] block uppercase">Sensor Ingress</span>
                    <span className="text-white font-bold text-sm truncate max-w-[120px] block">{selectedAttack.deviceName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={generatePDFReport}
                    className="p-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-blue-400 rounded-lg cursor-pointer flex items-center gap-1.5 text-[10px]"
                    title="Export as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button 
                    onClick={() => downloadReport('html')}
                    className="p-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-blue-400 rounded-lg cursor-pointer flex items-center gap-1.5 text-[10px]"
                    title="Export as HTML"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>HTML</span>
                  </button>
                  <button 
                    onClick={() => downloadReport('json')}
                    className="p-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-blue-400 rounded-lg cursor-pointer flex items-center gap-1.5 text-[10px]"
                    title="Export as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Assessment text areas */}
              <div className="space-y-3" id="executive-assessments">
                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] block uppercase font-bold">EXECUTIVE ASSESSMENT SUMMARY</span>
                  <p className="text-gray-300 leading-relaxed bg-[#050611] border border-blue-950 p-3 rounded-lg">
                    {selectedAttack.analysis?.summary}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-500 text-[10px] block uppercase font-bold">INCIDENT REMEDIATION RECOMMENDATIONS</span>
                  <div className="bg-[#050611] border border-blue-950 p-3 rounded-lg space-y-1.5">
                    {(selectedAttack.analysis?.recommendations || []).map((rec, index) => (
                      <div key={index} className="flex gap-2 text-gray-300">
                        <span className="text-blue-500 font-bold select-none">{index + 1}.</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MITRE ATT&CK MATRIX MODULE */}
          {reportType === 'mitre' && (
            <div className="space-y-4" id="report-mitre-module">
              <div className="flex items-center gap-3 bg-[#050611] border border-blue-950 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-orange-950/40 border border-orange-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Active MITRE ATT&CK Mapping</h4>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedAttack.analysis?.mitreAttack || 'T1110: Brute Force'}
                  </p>
                </div>
              </div>

              {/* Mapped framework matrices */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono" id="mitre-matrices-bento">
                <div className="p-3 bg-blue-950/15 border border-blue-950 rounded-lg">
                  <span className="text-gray-500 text-[9px] block uppercase mb-1">Tactical Stage</span>
                  <span className="text-white font-bold block">Credential Access</span>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Adversary is attempting to compromise usernames, encryption keys or administrative passwords.</p>
                </div>
                <div className="p-3 bg-blue-950/15 border border-blue-950 rounded-lg">
                  <span className="text-gray-500 text-[9px] block uppercase mb-1">Defense Evasion</span>
                  <span className="text-white font-bold block">Telemetry Bypassing</span>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Testing endpoint sensors to identify logging rate limits or firewall rule delays.</p>
                </div>
                <div className="p-3 bg-blue-950/15 border border-blue-950 rounded-lg">
                  <span className="text-gray-500 text-[9px] block uppercase mb-1">Lateral Movement</span>
                  <span className="text-white font-bold block">Port Propagation</span>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Scanning internal subnets after acquiring entry credentials via default socket listeners.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
