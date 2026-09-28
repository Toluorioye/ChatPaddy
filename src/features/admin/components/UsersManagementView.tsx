import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Ban,
  Clock,
  Coins,
  LogIn,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Key,
} from 'lucide-react';
import { useAdminStore, AdminUser } from '../adminStore';
import { useAuthStore } from '../../auth/authStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';
import { Avatar } from '../../../shared/ui/Avatar';

interface UsersManagementViewProps {
  onExitAdminToChat?: () => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({ onExitAdminToChat }) => {
  const {
    users,
    roles,
    addUser,
    editUser,
    deleteUser,
    banUser,
    suspendUser,
    unbanUser,
    creditUser,
  } = useAdminStore();
  const { signInDemoUser } = useAuthStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [banningUser, setBanningUser] = useState<AdminUser | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<AdminUser | null>(null);
  const [creditingUser, setCreditingUser] = useState<AdminUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Standard Member');
  const [avatar, setAvatar] = useState('');
  const [banReason, setBanReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');
  const [creditAmount, setCreditAmount] = useState(50);
  const [creditMemo, setCreditMemo] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setName('');
    setUsername('');
    setEmail('');
    setRole('Standard Member');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setIsAddUserOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
    setAvatar(u.avatar);
  };

  const handleSaveUser = () => {
    if (!name.trim() || !username.trim() || !email.trim()) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Name, username, and email are mandatory.' });
      return;
    }

    if (editingUser) {
      editUser(editingUser.id, { name, username, email, role, avatar });
      toast({ type: 'success', title: 'User Updated', message: `Updated profile details for ${name}.` });
      setEditingUser(null);
    } else {
      addUser({
        name,
        username,
        email,
        role,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        creditsBalance: 100,
        lastLogin: 'Never',
      });
      toast({ type: 'success', title: 'User Created', message: `${name} has been added to the system.` });
      setIsAddUserOpen(false);
    }
  };

  const handleLoginAsUser = (u: AdminUser) => {
    // Switch auth session to impersonate this user
    signInDemoUser({
      id: u.id,
      display_name: u.name,
      username: u.username,
      avatar_url: u.avatar,
      bio: `Logged in as ${u.role}`,
      phone: null,
      status_text: 'Available',
      is_online: true,
      last_seen_at: new Date().toISOString(),
      created_at: u.joinedAt,
      updated_at: new Date().toISOString(),
    });

    toast({
      type: 'info',
      title: 'Session Impersonation Active',
      message: `Now logged in as ${u.name} (@${u.username}).`,
    });

    if (onExitAdminToChat) {
      onExitAdminToChat();
    }
  };

  const handleConfirmBan = () => {
    if (!banningUser) return;
    banUser(banningUser.id, banReason || 'Terms of service violation');
    toast({ type: 'error', title: 'User Banned', message: `${banningUser.name} has been permanently banned.` });
    setBanningUser(null);
    setBanReason('');
  };

  const handleConfirmSuspend = () => {
    if (!suspendingUser) return;
    suspendUser(suspendingUser.id, suspendDays, suspendReason || 'Temporary policy review');
    toast({ type: 'info', title: 'User Suspended', message: `${suspendingUser.name} suspended for ${suspendDays} days.` });
    setSuspendingUser(null);
    setSuspendReason('');
  };

  const handleConfirmCredit = () => {
    if (!creditingUser) return;
    creditUser(creditingUser.id, creditAmount, creditMemo);
    toast({
      type: 'success',
      title: 'Credits Transferred',
      message: `Credited ${creditAmount} balance to ${creditingUser.name}.`,
    });
    setCreditingUser(null);
    setCreditMemo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            User Accounts & Moderation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage users, assign RBAC roles, impersonate user sessions, grant token credits, and enforce suspensions or bans.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, or email..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['all', 'active', 'suspended', 'banned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Credits</th>
                <th className="py-3 px-4 font-semibold">Joined / Activity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* User Profile Cell */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">@{u.username} · {u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : u.status === 'suspended'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {u.status === 'active'
                        ? '● Active'
                        : u.status === 'suspended'
                        ? `● Suspended (${u.suspensionEnd || 'temp'})`
                        : '● Banned'}
                    </span>
                    {u.banReason && (
                      <div className="text-[10px] text-rose-500 mt-0.5 line-clamp-1">{u.banReason}</div>
                    )}
                  </td>

                  {/* Credits */}
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    🪙 {u.creditsBalance}
                  </td>

                  {/* Activity */}
                  <td className="py-3 px-4 text-slate-500">
                    <div>Joined {u.joinedAt}</div>
                    <div className="text-[10px] text-slate-400">Active {u.lastLogin}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Login as User */}
                      <button
                        onClick={() => handleLoginAsUser(u)}
                        title="Login to User Account (Impersonate)"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                      </button>

                      {/* Credit User */}
                      <button
                        onClick={() => {
                          setCreditingUser(u);
                          setCreditAmount(50);
                        }}
                        title="Credit User Wallet"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                      </button>

                      {/* Suspend User */}
                      {u.status === 'active' ? (
                        <button
                          onClick={() => setSuspendingUser(u)}
                          title="Suspend User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            unbanUser(u.id);
                            toast({ type: 'success', title: 'User Restored', message: `${u.name} is now active.` });
                          }}
                          title="Restore / Unban User"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Ban User */}
                      {u.status !== 'banned' && (
                        <button
                          onClick={() => setBanningUser(u)}
                          title="Ban User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit User */}
                      <button
                        onClick={() => openEditModal(u)}
                        title="Edit User"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User */}
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete account for ${u.name}?`)) {
                            deleteUser(u.id);
                            toast({ type: 'info', title: 'User Deleted', message: `Removed ${u.name}.` });
                          }
                        }}
                        title="Delete User"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddUserOpen || editingUser) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddUserOpen(false);
            setEditingUser(null);
          }}
          title={editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Verified Member">Verified Member</option>
                  <option value="Standard Member">Standard Member</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  setEditingUser(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Credit User Modal */}
      {creditingUser && (
        <Modal
          isOpen={true}
          onClose={() => setCreditingUser(null)}
          title={`Credit User: ${creditingUser.name}`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Current balance: <span className="font-bold text-slate-900 dark:text-white">🪙 {creditingUser.creditsBalance}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credit Amount to Add (or negative to deduct)
              </label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Memo
              </label>
              <input
                type="text"
                value={creditMemo}
                onChange={(e) => setCreditMemo(e.target.value)}
                placeholder="e.g. Loyalty grant or promotion bonus"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCreditingUser(null)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCredit}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 cursor-pointer shadow-xs"
              >
                Apply Credits
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Ban User Modal */}
      {banningUser && (
        <Modal
          isOpen={true}
          onClose={() => setBanningUser(null)}
          title={`Ban User: ${banningUser.name}`}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
              Warning: Banning will immediately terminate active sessions and block authentication attempts.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ban Violation Reason
              </label>
              <textarea
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Describe reason for ban (e.g. Spreading malicious links)..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBanningUser(null)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend User Modal */}
      {suspendingUser && (
        <Modal
          isOpen={true}
          onClose={() => setSuspendingUser(null)}
          title={`Suspend User: ${suspendingUser.name}`}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suspension Duration (Days)
              </label>
              <select
                value={suspendDays}
                onChange={(e) => setSuspendDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Audit Note
              </label>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Temp mute pending report investigation"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs"
              >
                Enforce Suspension
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
