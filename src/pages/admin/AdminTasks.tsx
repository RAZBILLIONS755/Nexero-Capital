import { useState } from 'react';
import { Plus, CheckCircle, XCircle, Trash2, Edit2, Filter, Save, X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { generateId, formatCurrency, formatDate, getPlatformColor } from '../../utils/helpers';

const platforms = ['youtube', 'facebook', 'instagram', 'twitter', 'tiktok'];

export default function AdminTasks() {
  const { tasks, taskCompletions, addTask, updateTask, deleteTask, updateTaskCompletion, updateUserData, getUserById, adminConfig } = useDataStore();
  const [tab, setTab] = useState<'tasks' | 'submissions'>('submissions');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', platform: 'youtube', earning: '', link: '', isActive: true,
  });

  const pendingSubmissions = taskCompletions.filter((tc) => tc.status === 'pending');

  const handleSaveTask = () => {
    if (!form.title || !form.description || !form.earning || !form.link) return;

    if (editId) {
      updateTask(editId, {
        title: form.title,
        description: form.description,
        platform: form.platform as any,
        earning: parseFloat(form.earning),
        link: form.link,
        isActive: form.isActive,
      });
    } else {
      addTask({
        id: generateId(),
        title: form.title,
        description: form.description,
        platform: form.platform as any,
        earning: parseFloat(form.earning),
        link: form.link,
        isActive: form.isActive,
        completionsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    setShowForm(false);
    setEditId(null);
    setForm({ title: '', description: '', platform: 'youtube', earning: '', link: '', isActive: true });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setForm({
      title: task.title,
      description: task.description,
      platform: task.platform,
      earning: task.earning.toString(),
      link: task.link,
      isActive: task.isActive,
    });
    setEditId(taskId);
    setShowForm(true);
  };

  const handleApproveSubmission = (tcId: string) => {
    const tc = taskCompletions.find((t) => t.id === tcId);
    if (!tc) return;

    updateTaskCompletion(tcId, { status: 'approved' });

    const user = getUserById(tc.userId);
    if (user) {
      updateUserData(tc.userId, {
        taskBalance: parseFloat((user.taskBalance + tc.earning).toFixed(2)),
      });

      if (user.referredBy) {
        const referrer = getUserById(user.referredBy);
        if (referrer) {
          const commission = parseFloat(((adminConfig.referralTaskRate / 100) * tc.earning).toFixed(2));
          updateUserData(user.referredBy, {
            taskBalance: parseFloat((referrer.taskBalance + commission).toFixed(2)),
            referralTaskEarnings: parseFloat((referrer.referralTaskEarnings + commission).toFixed(2)),
          });
        }
      }
    }
  };

  const handleRejectSubmission = (tcId: string) => {
    updateTaskCompletion(tcId, { status: 'rejected' });
  };

  const filteredSubmissions = taskCompletions.filter((tc) =>
    submissionFilter === 'all' || tc.status === submissionFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {(['submissions', 'tasks'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {t} {t === 'submissions' && pendingSubmissions.length > 0 && `(${pendingSubmissions.length})`}
            </button>
          ))}
        </div>
        {tab === 'tasks' && (
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', description: '', platform: 'youtube', earning: '', link: '', isActive: true }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      {tab === 'tasks' && (
        <>
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">{editId ? 'Edit Task' : 'Create New Task'}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Task description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p} className="capitalize">{p}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Earning (GHC)"
                    value={form.earning}
                    onChange={(e) => setForm({ ...form, earning: e.target.value })}
                    step="0.50"
                    min="0.50"
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="url"
                  placeholder="Task link (https://...)"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    Active (visible to users)
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveTask} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl">
                    <Save size={15} /> Save Task
                  </button>
                  <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl">
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-900">All Tasks ({tasks.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 ${getPlatformColor(task.platform)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {task.platform.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{task.title}</div>
                    <div className="text-slate-400 text-xs capitalize">{task.platform} • {formatCurrency(task.earning)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateTask(task.id, { isActive: !task.isActive })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        task.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {task.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => handleEditTask(task.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'submissions' && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSubmissionFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                  submissionFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-900">Task Submissions ({filteredSubmissions.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No submissions found.</div>
              ) : (
                filteredSubmissions.map((tc) => {
                  const user = getUserById(tc.userId);
                  return (
                    <div key={tc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{user?.fullName || 'Unknown'}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{tc.taskTitle}</div>
                        <div className="text-slate-400 text-xs">{formatDate(tc.createdAt)}</div>
                        {tc.proofLink && (
                          <a href={tc.proofLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                            View Proof →
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-emerald-600 font-bold">{formatCurrency(tc.earning)}</span>
                        {tc.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveSubmission(tc.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectSubmission(tc.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            tc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tc.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
