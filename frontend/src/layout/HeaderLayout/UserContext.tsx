// context/UserContext.tsx
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GetUsersById } from '../../services/https/login';

interface UserContextType {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  username: string;
  setUsername: (name: string) => void;
}

const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrlState] = useState<string>("");
  const [username, setUsernameState] = useState<string>("");
 

  // โหลดค่าจาก localStorage หรือ API
  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatarUrl");
    const storedUsername = localStorage.getItem("username");
    

    if (storedAvatar) {
      setAvatarUrlState(storedAvatar);
    }

    if (storedUsername) {
      setUsernameState(storedUsername);
    }

    if (!storedAvatar || !storedUsername) {
      const userId = localStorage.getItem("id");
      if (userId) {
        GetUsersById(userId).then(res => {
          if (res.status === 200) {
            // avatar
            if (res.data.ProfileAvatar) {
              const url = `${PROFILE_BASE_URL}${res.data.ProfileAvatar.avatar}`;
              setAvatarUrlState(url);
              localStorage.setItem("avatarUrl", url);
            }
            // username
            if (res.data.username) {
              setUsernameState(res.data.username);
              localStorage.setItem("username", res.data.username);
            }
          }
        });
      }
    }
  }, []);

  const setAvatarUrl = (url: string) => {
    setAvatarUrlState(url);
    localStorage.setItem("avatarUrl", url);
  };

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem("username", name);
  };

  return (
    <UserContext.Provider value={{ avatarUrl, setAvatarUrl, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
