import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: '首页',
        },
        {
            key: '/plans',
            icon: <UnorderedListOutlined />,
            label: '我的计划',
        },
        {
            key: '/preferences',
            icon: <SettingOutlined />,
            label: '偏好设置',
        },
    ];

    return (
        <Layout className="main-layout">
            <Header className="main-header">
                <div className="logo">
                    <span className="logo-icon">✈️</span>
                    <span className="logo-text">AI 旅行规划师</span>
                </div>
                <div className="header-right">
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <div className="user-info">
                            <Avatar icon={<UserOutlined />} src={user?.avatar_url} />
                            <span className="username">{user?.username || user?.email}</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    className="main-sider"
                    width={220}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => navigate(key)}
                        className="main-menu"
                    />
                </Sider>
                <Content className="main-content">
                    <div className="content-wrapper">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
