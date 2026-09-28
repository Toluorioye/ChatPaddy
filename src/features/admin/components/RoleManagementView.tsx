import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  Save,
  Users,
  Lock,
  Layers,
} from 'lucide-react';
import { useAdminStore, AdminRole } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

// Granular permissions list
const ALL_PERMISSIONS: { id: string; name: string; category: string }[] = [
  // Features & Content
  { id: 'manage_features', name: 'Toggle Site Feature Flags', category: 'Platform & CMS' },
  { id: 'edit_site_layout', name: 'Edit Site Menus & Footer Layout', category: 'Platform & CMS' },
  { id: 'manage_pages', name: 'Create & Publish Content Pages', category: 'Platform & CMS' },
  { id: 'manage_seo', name: 'Generate Sitemaps & Edit SEO', category: 'Platform & CMS' },
  { id: 'manage_scripts', name: 'Inject Custom Scripts & AdSense', category: 'Platform & CMS' },

  // User Moderation
  { id: 'manage_users', name: 'Create & Edit User Profiles', category: 'Users & Moderation' },
  { id: 'ban_suspend_users', name: 'Ban & Suspend User Accounts', category: 'Users & Moderation' },
  { id: 'credit_users', name: 'Credit or Deduct User Balances', category: 'Users & Moderation' },
  { id: 'impersonate_users', name: 'Log in as User (Impersonation)', category: 'Users & Moderation' },
  { id: 'delete_any_message', name: 'Delete Any Chat Message / Thread', category: 'Users & Moderation' },

  // System & Financials
  { id: 'manage_roles', name: 'Add & Modify System Roles', category: 'Administration' },
  { id: 'manage_smtp', name: 'Configure SMTP Email Servers', category: 'Administration' },
  { id: 'send_announcements', name: 'Publish Broadcast Announcements', category: 'Administration' },
  { id: 'send_mass_notifications', name: 'Send Mass Push / Email Blasts', category: 'Administration' },
  { id: 'view_financials', name: 'Access Payment & Revenue Metrics', category: 'Administration' },
  { id: 'manage_referrals', name: 'Configure Referral Program & Commissions', category: 'Administration' },
];

export const RoleManagementView: React.FC = () => {
  const { roles, addRole, editRole, deleteRole } = useAdminStore();
  const { toast } = useToast();

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleColor, setRoleColor] = useState('#4F46E5');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const openAddModal = () => {
    setRoleName('');
    setRoleDesc('');
    setRoleColor('#4F46E5');
    setSelectedPermissions([]);
    setEditingRole(null);
    setIsAddRoleOpen(true);
  };

  const openEditModal = (r: AdminRole) => {
    setEditingRole(r);
    setRoleName(r.name);
    setRoleDesc(r.description);
    setRoleColor(r.color);
    setSelectedPermissions(r.permissions);
    setIsAddRoleOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      toast({ type: 'error', title: 'Role name required', message: 'Please specify a name for this role.' });
      return;
    }

    if (editingRole) {
      editRole(editingRole.id, {
        name: roleName,
        description: roleDesc,
        color: roleColor,
        permissions: selectedPermissions,
      });
      toast({ type: 'success', title: 'Role Updated', message: `Saved changes to "${roleName}".` });
    } else {
      addRole({
        name: roleName,
        description: roleDesc,
        color: roleColor,
        isSystem: false,
        permissions: selectedPermissions,
      });
      toast({ type: 'success', title: 'Role Created', message: `"${roleName}" role successfully provisioned.` });
    }

    setIsAddRoleOpen(false);
  };

  const handleDeleteRole = (r: AdminRole) => {
    if (r.isSystem && r.name === 'Super Admin') {
      toast({ type: 'error', title: 'Cannot Delete', message: 'The primary Super Admin role is protected.' });
      return;
    }

    if (confirm(`Are you sure you want to delete the "${r.name}" role?`)) {
      deleteRole(r.id);
      toast({ type: 'info', title: 'Role Deleted', message: `Removed "${r.name}".` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define administrative roles, manage authorization scopes, and configure fine-grained platform privileges.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className="w-4 h-4 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {r.name}
                    </h3>
                    {r.isSystem && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {(!r.isSystem || r.name !== 'Super Admin') && (
                  <button
                    onClick={() => handleDeleteRole(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
                {r.permissions.length} Granted Privileges
              </span>
              <span className="text-slate-400">{r.userCount} Assigned Users</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Role Modal */}
      {isAddRoleOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddRoleOpen(false)}
          title={editingRole ? `Edit Role: ${editingRole.name}` : 'Provision New System Role'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Compliance Officer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleColor}
                    onChange={(e) => setRoleColor(e.target.value)}
                    className="w-9 h-8 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={roleColor}
                    onChange={(e) => setRoleColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Description
              </label>
              <input
                type="text"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Explain the responsibilities granted by this role..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Permission Checkbox Matrix */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Permission Matrix ({selectedPermissions.length}/{ALL_PERMISSIONS.length})
                </span>
                <div className="flex gap-2 text-[11px]">
                  <button
                    onClick={selectAllPermissions}
                    className="text-[#4F46E5] font-semibold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={clearAllPermissions}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'border-[#4F46E5] bg-indigo-50/40 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {perm.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{perm.category}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save Role
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
