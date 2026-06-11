import { useState } from 'react';
import { Mail, CheckCircle, X, Clock } from 'lucide-react';
import Logo from '../../components/Logo';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency } from '../../utils/helpers';

export default function AdminSupport() {
  const supportTickets = useDataStore((s) => s.supportTickets || []);
  const getUserById = useDataStore((s) => s.getUserById);
  const updateSupportTicket = useDataStore((s) => s.updateSupportTicket);

  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const tickets = [...supportTickets].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const selectedTicket = tickets.find((t) => t.id === selected) || null;

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    updateSupportTicket(selected, { adminReply: reply.trim(), status: 'replied' });
    setReply('');
  };

  const handleClose = (id: string) => {
    updateSupportTicket(id, { status: 'closed' });
    if (selected === id) setSelected(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="light" />
          <div>
            <h2 className="text-2xl font-bold">Support Tickets</h2>
            <p className="text-sm text-slate-300">View and respond to user support requests</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-3">Tickets</h3>
          {tickets.length === 0 ? (
            <div className="text-sm text-slate-500">No support tickets yet.</div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {tickets.map((t) => {
                const user = t.userId ? getUserById(t.userId) : undefined;
                return (
                  <div key={t.id} onClick={() => setSelected(t.id)} className={`p-3 rounded-lg cursor-pointer border ${selected === t.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{t.subject || 'Support Request'}</div>
                      <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{user ? user.fullName : 'Guest'}</div>
                    <div className="text-xs mt-2">{t.message.slice(0, 80)}{t.message.length > 80 ? '...' : ''}</div>
                    <div className="text-xs mt-2 font-semibold">Status: <span className="ml-1 text-sm">{t.status}</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
          {!selectedTicket ? (
            <div className="text-center text-slate-500">Select a ticket to view details and reply.</div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedTicket.subject || 'Support Request'}</h3>
                  <div className="text-sm text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-slate-500 mt-2">From: {selectedTicket.userId ? (getUserById(selectedTicket.userId)?.fullName || selectedTicket.userId) : 'Guest'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleClose(selectedTicket.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm">Close</button>
                </div>
              </div>

              <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-sm text-slate-700">{selectedTicket.message}</div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold">Reply</label>
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className="w-full mt-2 p-3 border rounded-lg" placeholder="Write a response to the user" />
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={handleReply} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send Reply</button>
                  <button onClick={() => { setReply(''); }} className="px-3 py-2 text-sm text-slate-600">Clear</button>
                </div>
              </div>

              {selectedTicket.adminReply && (
                <div className="mt-4 bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800">
                  <div className="font-semibold">Admin reply</div>
                  <div className="mt-2 whitespace-pre-wrap">{selectedTicket.adminReply}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
