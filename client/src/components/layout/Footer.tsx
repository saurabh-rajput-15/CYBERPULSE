import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#faf5e8] dark:bg-[#0c121e] border-t border-[#e5e5e5] dark:border-[#1e293b] py-4 text-xs text-[#6a6a6a]">
      <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-[#0a0a0a] dark:text-[#f8fafc]">ZK-PACE</span>
          <span>—</span>
          <span className="dark:text-[#94a3b8]">Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation & Defense Optimizer (S. Girase et al.)</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono dark:text-[#64748b]">
          <span>zk-SNARKs: BN254 Groth16</span>
          <span>Math: Open FAIR™ + OR-Tools MILP</span>
        </div>
      </div>
    </footer>
  );
};
