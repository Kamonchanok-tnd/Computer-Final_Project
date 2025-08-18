import { useEffect, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, type MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const { Header, Content } = Layout;
import { Book, House, LogOut, Menu, MessageCircleMore, Moon, Music, Plus,  Sun, User } from 'lucide-react';
import { useDarkMode } from '../../components/Darkmode/toggleDarkmode';

const items = [
  { key: 'home', label: 'หน้าหลัก', path: '/user', icon: <House size={24} /> },
  { key: 'chat', label: 'แชท', path: '/chat', icon: <MessageCircleMore size={24} /> },
  { key: 'contents', label: 'คอนเท้นต์', path: '/audiohome', icon: <Music size={24} /> },
  { key: 'message', label: 'ทีมพัฒนา', path: '/contents', icon: <Book size={24} /> },
];

function Headers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Handle Logout function should be declared before it's used
  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Navigate to home or login page
  };
 
  

  const dropdownItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="text-sm text-[#666] font-medium ">
          Profile
        </div>
      ),
      icon: <User size={20} color='#666' />,
      onClick: () => {
      navigate('/edit-profile'); // เพิ่มการนำทางไปยังหน้า UserEdit
    }
    },
    {
      key: '2',
      label: (
        <div className="text-sm text-rose-600 font-medium ">
          Logout
        </div>
      ),
      icon: <LogOut size={20} color='red' />,
      onClick: handleLogout, // เพิ่มการเรียกฟังก์ชัน handleLogout
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

  const handleMenuClick = (menuKey: string, path: string) => {
    navigate(path);
    setActiveMenu(menuKey);
    setOpen(false); // ปิด drawer เมื่อคลิกเมนูใน mobile
  };

  return (
    <>
      <Layout style={{ border: '1px solid #f0f0f0' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#0F172A' : '#fff',
            boxShadow:isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0px 4px 4px rgba(0, 0, 0, 0.02)',
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
                        onClick={() => handleMenuClick(item.key, item.path)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm 
                          ${
                            activeMenu === item.key
                              ? isDarkMode
                                ? 'bg-button-dark/20 text-blue-word' 
                                : 'bg-background-button text-blue-word' 
                              : isDarkMode
                              ? 'hover:bg-button-dark/20  text-text-dark hover:text-blue-word'
                              : 'hover:bg-background-button hover:text-blue-word'
                          }
                        `} 
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
          </div>
          <div className='hidden md:flex gap-4 justify-center items-center'>
            {/* <button
              onClick={() => navigate('/audiohome/mirror')}
              className="flex gap-2 items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm bg-button-blue
             text-white hover:bg-button-blue"
            >
              <Plus size={24} />
              Mirror
            </button> */}
            <button
              onClick={toggleDarkMode}
              className={`
                relative inline-flex items-center justify-center
                w-8 h-8 rounded-full p-2
                transition-all duration-300 ease-in-out
                ${isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isDarkMode? 'focus:ring-yellow-400' : 'focus:ring-blue-500'}
                shadow-lg 
                transform  active:scale-95
              `}
              aria-label={`Switch to ${isDarkMode ? 'dark' : 'light'} mode`}
            >
              <div className="relative w-5 h-5">
                {isDarkMode? (
                  <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
                ) : (
                  <Sun className="w-5 h-5 transition-transform duration-300 rotate-180" />
                )}
              </div>
            </button>
            <Dropdown menu={{ items: dropdownItems }}>
              <a onClick={(e) => e.preventDefault()}>
                <Avatar size="large" icon={<UserOutlined />} />
              </a>
            </Dropdown>
          </div>
          <div className='md:hidden' onClick={showDrawer}>
            <Menu />
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
                <div key={item.key}>
                  <li>
                    <button
                      onClick={() => handleMenuClick(item.key, item.path)}
                      className={`w-full text-left px-4 py-2 rounded flex gap-2 ${
                        activeMenu === item.key ? 'bg-background-button text-blue-word' : 'hover:bg-background-button hover:text-blue-word duration-300'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  </li>
                </div>
              ))}
              <li>
                <button className='bg-button-blue w-full px-4 py-2 rounded-sm text-white hover:bg-[#C8F3FD]' >
                  <div className='flex items-center gap-2 justify-center'>
                    <Plus size={24} />
                    <p>Create</p>
                  </div>
                </button>
              </li>
              <li>
                {/* Add Logout button */}
                <Button danger block onClick={handleLogout}>
                  Logout
                </Button>
              </li>
            </ul>
          </Drawer>

        </Header>
        <Content style={{ height: 'calc(100vh - 64px) '  }}>
          <Outlet />
        </Content>
      </Layout>
    </>
  );
}

export default Headers;
