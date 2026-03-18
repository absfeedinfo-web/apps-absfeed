
import React from 'react';
import { User, UserCheck, MapPin } from 'lucide-react';

interface PrintHeaderProps {
  companyName: string;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ companyName, title, subtitle, showLogo = true }) => {
  return (
    <div className="border-b-4 border-[#722f37] pb-6 text-center mb-8 relative">
      <div className="flex justify-between items-start">
        {showLogo && (
          <div className="w-20 h-20 bg-[#722f37] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <span className="text-2xl font-black italic">ABS</span>
          </div>
        )}
        <div className="flex-1 text-center px-4">
          <h1 className="text-4xl font-black text-[#722f37] uppercase leading-none tracking-tighter">{companyName}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">(A Sister Concern of AHYAN GROUP)</p>
          
          <div className="grid grid-cols-2 gap-8 text-[9px] mt-4 font-bold text-slate-500 text-left">
            <div className="border-l-2 border-slate-200 pl-4">
              <p className="font-black text-[#722f37] uppercase text-[10px] mb-1">Head Office:</p>
              <p>House No. 12 (4th floor), Road No. 25, Sector-07, Uttara, Dhaka-1230</p>
              <p>Email: absfeed.info@gmail.com | Phone: +8809638-201686</p>
            </div>
            <div className="text-right border-r-2 border-slate-200 pr-4">
              <p className="font-black text-[#722f37] uppercase text-[10px] mb-1">Regional Office:</p>
              <p>Ahyan City, Bagerdanga, Fultola, Khulna-9210</p>
              <p>Phone: +8801918-594466 | Web: www.absfeed.com</p>
            </div>
          </div>
        </div>
        {showLogo && <div className="w-20 h-20 opacity-0 shrink-0"></div>} {/* Spacer for balance */}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="bg-slate-900 text-white px-10 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-xl border-2 border-white/20">
          {title}
        </div>
      </div>
      {subtitle && (
        <p className="text-[10px] text-slate-400 font-black uppercase mt-3 tracking-[0.2em]">{subtitle}</p>
      )}
    </div>
  );
};
