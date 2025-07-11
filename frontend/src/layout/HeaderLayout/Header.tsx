import  { useEffect, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, theme, type MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const { Header, Content, Footer } = Layout;
import { Book, House, LogOut, Menu, MessageCircleMore, Music, Plus, Space, User } from 'lucide-react'



const items = [
    { key: 'home', label: 'Home', path: '/user', icon: <House size={24} /> },
    { key: 'chat', label: 'Chat', path: '/chat', icon: <MessageCircleMore size={24} /> },
    { key: 'contents', label: 'Contents', path: '/audiohome', icon: <Music size={24} /> },
    { key: 'message', label: 'Message', path: '/contents', icon: <Book size={24} /> },
  ];


 
function Headers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');

  const dropdownItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="text-sm text-[#666] font-medium " >
            Profile
        </div>
        
      ),
      icon: <User size={20} color='#666'/>,
    },
    {
        key: '2',
      label: (
        <div className="text-sm text-rose-600 font-medium ">
            Profile
        </div>
      ),
      icon: <LogOut size={20} color='red'/>
    }
  ];

  useEffect(() => {
    const currentItem = items.find(item => location.pathname.startsWith(item.path));
    setActiveMenu(currentItem?.key || '');
  }, [location.pathname]);

    const showDrawer = () => {
        setOpen(true);
      };
    
      const onClose = () => {
        setOpen(false);
      };

      const handleMenuClick = (menuKey: string,path: string) => {
        navigate(path);
        setActiveMenu(menuKey);
        setOpen(false); // ปิด drawer เมื่อคลิกเมนูใน mobile
      };
    return (
        <>
         <Layout style={
          { border: '1px solid #f0f0f0',}
         }>
    
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.02)',
          padding: '0 24px',
         
        }}
        
      >
        <div className='flex gap-4'>
            <div className='logo mr-2'>
                    <h1 className='text-black'>Logo</h1>
                    </div>
            <ul className='hidden md:flex gap-5'>
               
            {items.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => handleMenuClick(item.key,item.path)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm 
                      ${activeMenu === item.key 
                        ? 'bg-[#C8F3FD] text-[#1890ff] ' 
                        : 'hover:bg-[#C8F3FD] hover:text-[#1890ff] duration-300'
                      }`}
                   
                  >
                    {item.label}
                  </button>
                </li>
              ))}
               
            </ul>
        </div>
        <div  className='hidden md:flex gap-4 justify-center items-center'>
        <button
            onClick={() => navigate('/create')}
            className="flex gap-2 items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm bg-[#9AEDFF]
             text-white hover:bg-[#C8F3FD]"
            >
            <Plus size={24}/>
            Mirror
            </button>
            <Dropdown menu={{ items: dropdownItems }} >
                <a onClick={(e) => e.preventDefault()}>
                    <Avatar size="large" icon={<UserOutlined />} />
                </a>
            </Dropdown>
          
        </div>
        <div className='md:hidden' onClick={showDrawer}>
            
            <Menu/>
            </div>   
         
       
             <Drawer
                title="Menu"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={open}
            >
                <ul className="flex flex-col gap-4">
                    <div>
                        Profile
                    </div>
                    {items.map(item => (
                    <div key={item.key} >
                      
                        <li >
                        <button
                        onClick={() => handleMenuClick(item.key, item.path)}
                        className={`w-full text-left px-4 py-2 rounded flex gap-2 ${
                            activeMenu === item.key ? 'bg-[#C8F3FD] text-[#1890ff]' : 'hover:bg-[#C8F3FD] hover:text-[#1890ff] duration-300'
                        }`}
                        >
                        {item.icon}
                        {item.label}
                        </button>
                    </li>
                    </div>
                    
                    ))}
                    <li>
                    <button className='bg-[#9AEDFF] w-full px-4 py-2 rounded-sm text-white hover:bg-[#C8F3FD]' >
                      <div className='flex items-center gap-2 justify-center'>
                        <Plus size={24}/>
                         <p>Create</p>
                        </div> 
                       </button>
                    </li>
                    <li>
                    <Button danger block>Logout</Button>
                    </li>
                </ul>         
            </Drawer>

      </Header>
      <Content style={{ height: 'calc(100vh - 64px)' }}>
       <Outlet />
      </Content>
      {/* <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer> */}
    </Layout>
        </>
    );
}
export default Headers