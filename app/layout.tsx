// Fix: Added missing React import to resolve "Cannot find namespace 'React'" error on line 13.
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ABS FEED INDUSTRIES LIMITED - ERP',
  description: 'Sales & Inventory System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #555; }

          @media print {
              @page { size: A4; margin: 10mm; }
              .no-print { display: none !important; }
              .no-print-section { display: none !important; }
              .print-p-0 { padding: 0 !important; }
              .print-m-0 { margin: 0 !important; }
              
              * { 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
              }
              
              body { 
                  background: white !important; 
                  margin: 0 !important; 
                  padding: 0 !important;
                  visibility: hidden;
              }

              .modal-overlay {
                  visibility: visible !important;
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: block !important;
              }

              .modal-overlay * {
                  visibility: visible !important;
              }

              .modal-container { 
                  position: relative !important; 
                  width: 100% !important;
                  max-width: none !important;
                  min-height: auto !important;
                  box-shadow: none !important; 
                  border: none !important;
                  border-radius: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  display: block !important;
                  background: white !important;
              }

              .invoice-content {
                  overflow: visible !important;
                  height: auto !important;
                  padding: 0 !important;
                  margin: 0 !important;
              }

              .invoice-footer {
                  page-break-inside: avoid !important;
                  margin-top: 50px !important;
              }

              table { 
                  width: 100% !important; 
                  border-collapse: collapse !important; 
              }
              
              thead {
                  display: table-header-group !important;
              }

              tr { 
                  page-break-inside: avoid !important; 
              }
              
              /* Ensure colors are preserved in specific elements */
              .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
              .bg-[#722f37] { background-color: #722f37 !important; color: white !important; }
              .text-[#722f37] { color: #722f37 !important; }
              .bg-rose-50 { background-color: #fff1f2 !important; }
              .bg-emerald-50 { background-color: #ecfdf5 !important; }
              .bg-slate-50 { background-color: #f8fafc !important; }
          }
        `}</style>
      </head>
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}