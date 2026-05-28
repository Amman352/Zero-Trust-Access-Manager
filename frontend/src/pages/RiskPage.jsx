import AppLayout from '../components/layout/AppLayout';
export default function RiskPage() {
  return (
    <AppLayout title="Risk Engine" subtitle="ML-powered risk scoring">
      <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-16 text-center">
        <p className="text-[#333] text-4xl mb-4">⬡</p>
        <h3 className="text-white font-semibold mb-2">Risk Engine</h3>
        <p className="text-[#444] text-sm">ML-powered risk scoring · Coming in next phase</p>
      </div>
    </AppLayout>
  );
}
