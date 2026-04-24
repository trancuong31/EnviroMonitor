import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuthStore } from '../../../store';
import UserList from '../components/UserList';
import UserEditor from '../components/UserEditor';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout/MainLayout';

const ROLES = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'User', label: 'User' },
];

const FACTORIES = [
    { value: 'ALL', label: 'ALL' },
    { value: 'D2', label: 'D2' },
    { value: 'V0', label: 'V0' },
    { value: 'V1', label: 'V1' },
    { value: 'V2', label: 'V2' },
    { value: 'V4', label: 'V4' },
    { value: 'V5', label: 'V5' },
];

const UserManagement = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuthStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(true); // Always true as per request
    const [departments, setDepartments] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, departmentsRes] = await Promise.all([
                api.get('/users'),
                api.get('/users/departments')
            ]);
            setUsers(usersRes.data?.data?.users || []);
            
            // Format departments for CustomSelect
            const deptOptions = (departmentsRes.data?.data?.departments || []).map(dept => ({
                value: dept.departmentID,
                label: dept.departmentID
            }));
            setDepartments(deptOptions);
        } catch (error) {
            console.error('Error fetching users or departments:', error);
            toast.error(t('dashboard.error', 'Error loading data'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (currentUser?.role === 'Admin') {
            fetchUsers();
        }
    }, [currentUser, fetchUsers]);

    // Redirect if not admin (must happen after hooks)
    if (currentUser?.role !== 'Admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setSelectedUser(null);
        // isEditing is already true
    };

    const handleCancelEdit = () => {
        setSelectedUser(null);
    };

    const handleSaveUser = async (userData, forceCreate = false) => {
        try {
            // if information is not changed and not forceCreate, do not save
            if (!forceCreate && selectedUser?.id && 
                selectedUser?.fullname === userData.fullname && 
                selectedUser?.userid === userData.userid && 
                selectedUser?.role === userData.role && 
                userData.password === '' && 
                selectedUser?.factory === userData.factory && 
                selectedUser?.department === userData.department &&
                selectedUser?.status === userData.status && 
                selectedUser?.emailAlert === userData.emailAlert) {
                toast.warning(t('admin.noChanges', 'No changes made'));
                return;
            }
            
            // add eventuser to userData
            userData.eventuser = currentUser.id;
            
            if (selectedUser?.id && !forceCreate) {
                // Update
                await api.put(`/users/${selectedUser.id}`, userData);
                toast.success(t('admin.updatedSuccess', 'User updated successfully'));
            } else {
                // Create
                // Ensure password is provided for new user if it was empty in the form during "Update" mode but clicked "Create"
                if (!userData.password && forceCreate) {
                    toast.error(t('auth.enterPassword', 'Password is required for new users'));
                    return;
                }
                await api.post('/users', userData);
                toast.success(t('admin.createdSuccess', 'User created successfully'));
            }
            await fetchUsers();
            setSelectedUser(null);
        } catch (error) {
            console.error('Error saving user:', error);
            const msg = error.response?.data?.message || t('admin.errorOccurred', 'An error occurred');
            toast.error(msg);
        }
    };

    const handleDeleteUser = async (userToDelete) => {
        if (userToDelete.id === currentUser.id) {
            toast.error(t('admin.cannotDeleteSelf', 'You cannot delete your own account.'));
            return;
        }

        // Thay thế window.confirm bằng toast với nút Yes/No của Sonner
        toast(t('admin.deleteConfirm', 'Are you sure you want to delete this user?'), {
            duration: 5000,
            cancel: {
                label: t('common.no', 'No'),
                onClick: () => console.log('Delete canceled')
            },
            action: {
                label: t('common.yes', 'Yes'),
                onClick: async () => {
                    try {
                        await api.delete(`/users/${userToDelete.id}`);
                        toast.success(t('admin.deletedSuccess', 'User deleted successfully'));
                        
                        if (selectedUser?.id === userToDelete.id) {
                            setIsEditing(false);
                            setSelectedUser(null);
                        }
                        
                        await fetchUsers();
                    } catch (error) {
                        console.error('Error deleting user:', error);
                        const msg = error.response?.data?.message || t('admin.errorOccurred', 'An error occurred');
                        toast.error(msg);
                    }
                }
            }
        });
    };

    return (
        <MainLayout>
            <div className="px-6 md:px-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col pt-2 pb-6 w-full">
                
                {/* Header Section */}
                <div className="mb-3 flex flex-row items-start sm:items-center gap-4 animate-slide-down">
                    {/* Column 1: Back Button */}
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/80 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    {/* Column 2: Title and Description */}
                    <div>
                        <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            {t('admin.userManagement', 'User Management')}
                        </h1>
                        <p className="text-text-muted mt-0.5 text-sm">
                            {t('admin.userManagementDesc', 'Manage system users, roles, and access')}
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden animate-fade-in delay-100">
                    
                    {/* Left Panel: User List */}
                    <div 
                        className="transition-all duration-500 ease-in-out h-full flex flex-col lg:w-[65%] lg:pr-6"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full bg-surface rounded-2xl border border-border shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-text-muted font-medium">{t('dashboard.loading', 'Loading data...')}</p>
                                </div>
                            </div>
                        ) : (
                            <UserList
                                users={users}
                                selectedUser={selectedUser}
                                onSelectUser={handleSelectUser}
                                onDeleteUser={handleDeleteUser}
                                onAddNew={handleAddNew}
                            />
                        )}
                    </div>

                    {/* Right Panel: Editor (Slides in) */}
                    <div 
                        className="absolute lg:relative right-0 top-0 h-full bg-background z-10 lg:z-auto transition-all duration-500 ease-in-out w-full lg:w-[35%] translate-x-0 opacity-100 visibility-visible"
                    >
                        <div className="w-full h-full lg:min-w-[340px] lg:pl-2">
                            <UserEditor
                                user={selectedUser}
                                onSave={handleSaveUser}
                                onDelete={handleDeleteUser}
                                onAddNew={handleAddNew}
                                roles={ROLES}
                                factories={FACTORIES}
                                departments={departments}
                            />
                        </div>
                    </div>
                    
                </div>
            </div>
        </MainLayout>
    );
};

export default UserManagement;