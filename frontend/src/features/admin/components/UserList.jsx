import { useTranslation } from 'react-i18next';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';

const UserList = ({ users, selectedUser, onSelectUser, onDeleteUser, onAddNew }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-[10px_18px] border-b border-border bg-surface-alt/50 shrink-0">
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

            {/* Table Container */}
            <div className="flex-1 overflow-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    {/* Table Head (Sticky) */}
                    <thead className="sticky top-0 bg-surface z-10 shadow-sm border-b border-border">
                        <tr>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider w-[5%]">
                                {t('admin.tableNo', 'No')}
                            </th>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider w-[30%]">
                                {t('admin.tableUser', 'User')}
                            </th>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider w-[15%]">
                                {t('admin.tableRole', 'Role')}
                            </th>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider w-[10%]">
                                {t('admin.tableFactory', 'Factory')}
                            </th>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider w-[25%]">
                                {t('admin.tableStatus', 'Status')}
                            </th>
                            <th className="py-4 px-6 text-sm font-semibold text-text-muted uppercase tracking-wider text-right w-[20%]">
                                {t('admin.tableActions', 'Actions')}
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-border">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-text-muted">
                                        <p>{t('admin.noUsersFound', 'No users found')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr
                                    key={user.id}
                                    onClick={() => onSelectUser(user)}
                                    className={`group transition-all duration-200 cursor-pointer ${
                                        selectedUser?.id === user.id
                                            ? 'bg-primary/5'
                                            : 'bg-surface hover:bg-surface-hover'
                                    }`}
                                >
                                    {/* Column: No */}
                                    <td className="py-3 px-6">
                                        <span className="text-sm font-medium text-text">
                                            {index + 1}
                                        </span>
                                    </td>
                                    {/* Column: User (Avatar + Name + Email) */}
                                    <td className="py-3 px-6">
                                        <div className="flex items-center">
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0 ${
                                                selectedUser?.id === user.id 
                                                    ? 'bg-primary text-white' 
                                                    : 'bg-gradient-to-br from-surface-alt to-border text-text'
                                            }`}>
                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {/* Name & Email */}
                                            <div className="ml-3 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-primary' : 'text-text'}`}>
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-text-muted truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Column: Role */}
                                    <td className="py-3 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold capitalize tracking-wide rounded-md border ${
                                            user.role === 'admin'
                                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* Column: Factory */}
                                    <td className="py-3 px-6">
                                        <span className="text-sm font-medium text-text">
                                            {user.factory || '-'}
                                        </span>
                                    </td>

                                    {/* Column: Status */}
                                    <td className="py-3 px-6">
                                        {user.status === 'inactive' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-error/10 text-error rounded-full">
                                                {t('admin.statusInactive', 'Inactive')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-success/10 text-success rounded-full">
                                                {t('admin.statusActive', 'Active')}
                                            </span>
                                        )}
                                    </td>

                                    {/* Column: Actions */}
                                    <td className="py-3 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectUser(user);
                                                }}
                                                className="relative group/edit p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                                <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover/edit:opacity-100 group-hover/edit:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg pointer-events-none">
                                                    {t('admin.editUser', 'Edit')}
                                                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                                </span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteUser(user);
                                                }}
                                                className="relative group/delete p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg pointer-events-none">
                                                    {t('admin.deleteUser', 'Delete')}
                                                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;