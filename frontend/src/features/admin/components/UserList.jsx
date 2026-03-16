import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Mail, Shield, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui';

const UserList = ({ users, selectedUser, onSelectUser, onDeleteUser, onAddNew }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-[10px_18px] border-b border-border bg-surface-alt/50">
                <div>
                    <h2 className="text-xl font-bold">{t('admin.users', 'Users')}</h2>
                    <p className="text-sm text-text-muted mt-1">
                        {t('admin.totalUsers', 'Total')}: <span className="font-semibold text-text">{users.length}</span>
                    </p>
                </div>
                <Button variant="primary" onClick={onAddNew} className="shadow-md shadow-primary/20">
                    + {t('admin.addUser', 'Add User')}
                </Button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <p>{t('admin.noUsersFound', 'No users found')}</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => onSelectUser(user)}
                            className={`group flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                                selectedUser?.id === user.id
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'bg-surface border-border hover:border-primary/50'
                            }`}
                        >
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm shrink-0 ${
                                selectedUser?.id === user.id 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gradient-to-br from-surface-alt to-border text-text'
                            }`}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>

                            {/* User Info */}
                            <div className="ml-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold truncate ${selectedUser?.id === user.id ? 'text-primary' : 'text-text'}`}>
                                        {user.name}
                                    </h3>
                                    {user.status === 'inactive' && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-error/10 text-error rounded-full">
                                            {t('admin.statusInactive', 'Inactive')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Mail size={12} className="shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Shield size={12} className="shrink-0 text-amber-500/80" />
                                        <span className="capitalize text-amber-500/80 font-medium">{user.role}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Building2 size={12} className="shrink-0 text-green-500/80" />
                                        <span className="text-green-500/80 font-medium">{user.factory}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectUser(user);
                                    }}
                                    className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    title={t('admin.editUser', 'Edit User')}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteUser(user);
                                    }}
                                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                    title={t('admin.deleteUser', 'Delete User')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
