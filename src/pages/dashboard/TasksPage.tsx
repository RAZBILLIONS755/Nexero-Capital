import { useState } from 'react';
import { CheckSquare, ExternalLink, CheckCircle, AlertCircle, Clock, Zap, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { generateId, formatCurrency, getPlatformColor, getStatusColor, formatDate } from '../../utils/helpers';

const platformLabels: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  tiktok: 'TikTok',
};

export default function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, taskCompletions, addTaskCompletion, adminConfig, getUserById } = useDataStore();

  const freshUser = user ? getUserById(user.id) : null;
  const u = freshUser || user;

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userCompletions = taskCompletions.filter((tc) => tc.userId === user?.id);
  const completedTaskIds = userCompletions
    .filter((tc) => tc.status === 'approved')
    .map((tc) => tc.taskId);

  const activeTasks = tasks.filter((t) => t.isActive);

  const handleSubmitTask = (taskId: string) => {
    setError('');

    if (!proofLink.trim()) {
      setError('Please provide your proof link.');
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (completedTaskIds.includes(taskId)) {
      setError('You have already completed this task.');
      return;
    }

    const alreadyPending = userCompletions.find(
      (tc) => tc.taskId === taskId && tc.status === 'pending'
    );
    if (alreadyPending) {
      setError('You have already submitted this task. Awaiting approval.');
      return;
    }

    addTaskCompletion({
      id: generateId(),
      userId: user!.id,
      taskId,
      taskTitle: task.title,
      earning: task.earning,
      status: 'pending',
      proofLink: proofLink.trim(),
      createdAt: new Date().toISOString(),
    });

    setSuccess(`Task submission successful! GHC ${task.earning.toFixed(2)} will be credited after approval.`);
    setSelectedTask(null);
    setProofLink('');
  };

  const taskProgress = (u?.taskBalance || 0) + userCompletions
    .filter((tc) => tc.status === 'pending')
    .reduce((sum, tc) => sum + tc.earning, 0);

  const progressPct = Math.min(100, (taskProgress / adminConfig.taskMinWithdrawal) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Task Earnings</h2>
        <p className="text-slate-500 mt-1">Complete social media tasks and earn daily income — no investment required.</p>
      </div>

      {/* Task Balance & Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={20} />
            <span className="font-semibold text-sm">Task Balance</span>
          </div>
          <div className="text-3xl font-black">{formatCurrency(u?.taskBalance || 0)}</div>
          <div className="text-emerald-100 text-xs mt-1">
            {completedTaskIds.length} task(s) completed
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-amber-500" />
            <span className="font-semibold text-slate-900 text-sm">Withdrawal Progress</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-500 text-xs">
                {formatCurrency(u?.taskBalance || 0)} / {formatCurrency(adminConfig.taskMinWithdrawal)}
              </span>
              <span className="text-blue-600 font-bold text-sm">{progressPct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <p className="text-slate-400 text-xs">
            {(u?.taskBalance || 0) >= adminConfig.taskMinWithdrawal
              ? '✅ Eligible for withdrawal!'
              : `Earn ${formatCurrency(Math.max(0, adminConfig.taskMinWithdrawal - (u?.taskBalance || 0)))} more to withdraw`}
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
          <CheckCircle size={16} className="shrink-0" /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-blue-800 text-sm">
          <strong>How it works:</strong> Click a task link, complete the action, copy your proof link (e.g., your comment URL or screenshot link), paste it below, and submit. Earnings are credited after manual verification.
          <br />Minimum withdrawal: <strong>{formatCurrency(adminConfig.taskMinWithdrawal)}</strong>
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {activeTasks.map((task) => {
          const isCompleted = completedTaskIds.includes(task.id);
          const isPending = userCompletions.some(
            (tc) => tc.taskId === task.id && tc.status === 'pending'
          );
          const isSelected = selectedTask === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
                isCompleted
                  ? 'border-emerald-200 opacity-75'
                  : isSelected
                  ? 'border-blue-400'
                  : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 ${getPlatformColor(task.platform)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {task.platform === 'youtube' ? '▶' :
                     task.platform === 'facebook' ? 'f' :
                     task.platform === 'instagram' ? '📸' :
                     task.platform === 'twitter' ? '𝕏' : '♪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {platformLabels[task.platform]}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Completed</span>
                      )}
                      {isPending && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Pending</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{task.title}</h4>
                  </div>
                </div>

                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{task.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-emerald-600 font-black text-xl">{formatCurrency(task.earning)}</div>
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Open Task <ExternalLink size={14} />
                  </a>
                </div>

                {!isCompleted && !isPending && (
                  <>
                    {!isSelected ? (
                      <button
                        onClick={() => { setSelectedTask(task.id); setError(''); }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        Submit Proof
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {error && (
                          <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-2">
                            <AlertCircle size={12} /> {error}
                          </div>
                        )}
                        <input
                          type="url"
                          placeholder="Paste your proof link here..."
                          value={proofLink}
                          onChange={(e) => setProofLink(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedTask(null); setError(''); }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitTask(task.id)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-emerald-700 text-sm font-semibold">Completed & Credited</span>
                  </div>
                )}

                {isPending && !isCompleted && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-amber-700 text-sm font-semibold">Awaiting Verification</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <CheckSquare size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No tasks available at the moment. Check back soon.</p>
        </div>
      )}

      {/* Task History */}
      {userCompletions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Task History</h3>
          </div>
          <div className="p-5 space-y-3">
            {userCompletions.map((tc) => (
              <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm truncate">{tc.taskTitle}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{formatDate(tc.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-emerald-600 font-bold text-sm">{formatCurrency(tc.earning)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(tc.status)}`}>
                    {tc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
