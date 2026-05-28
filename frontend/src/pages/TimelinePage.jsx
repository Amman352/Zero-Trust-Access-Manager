import AppLayout from '../components/layout/AppLayout';
export default function TimelinePage() {
  return (
    <AppLayout title="Session Timeline" subtitle="Chronological access history">
      <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-16 text-center">
        <p className="text-[#333] text-4xl mb-4">⬡</p>
        <h3 className="text-white font-semibold mb-2">Session Timeline</h3>
        <p className="text-[#444] text-sm">Chronological access history · Coming in next phase</p>
      </div>
    </AppLayout>
  );
}
