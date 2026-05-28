import AppLayout from '../components/layout/AppLayout';
export default function MonitoringPage() {
  return (
    <AppLayout title="Live Monitoring" subtitle="Real-time system telemetry">
      <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-16 text-center">
        <p className="text-[#333] text-4xl mb-4">⬡</p>
        <h3 className="text-white font-semibold mb-2">Live Monitoring</h3>
        <p className="text-[#444] text-sm">Real-time system telemetry · Coming in next phase</p>
      </div>
    </AppLayout>
  );
}
