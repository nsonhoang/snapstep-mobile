import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, type User } from '@react-native-firebase/auth';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';


interface AuthProviderProps {
  children: ReactNode;
}


interface AuthContextType {
  user: User | null;
  initializing: boolean;
  login: (email:string, password:string) => Promise<void>;
  register: (email:string, password:string) => Promise<void>;
  reloadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
 

   useEffect(() => {
   
    function handleAuthStateChanged(currentUser: User | null) {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    }
    
 
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber;
  }, [initializing]);

 
  

  const register = async (email:string, password:string )=>{
    createUserWithEmailAndPassword(getAuth(),email,password)
  .then( async() => {
    console.log('User account created & signed in!');
    
    const newUser = getAuth().currentUser;
    console.log("đăng ký " + newUser?.email);

    if (newUser && !newUser.emailVerified) {
         await sendEmailVerification(newUser);
          console.log('Đã gửi email xác thực đến:', newUser.email);
        }
   
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('That email address is already in use!');
    }
    if (error.code === 'auth/invalid-email') {
      console.log('That email address is invalid!');
    }
    console.error(error);
  });
  }

  const login = async (email:string, pass:string)=>{
    signInWithEmailAndPassword(getAuth(),email,pass)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log('User logged in!', user);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Error logging in:', errorCode, errorMessage);
  });
}

  
  const logout = async ()=>{
    await getAuth().signOut();
    console.log('User logged out!');
    console.log("đăng xuất "+user?.email);
  }

  const reloadUser = async () => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      await currentUser.reload();
      if(currentUser.emailVerified){
       
        setUser({...user, emailVerified: currentUser.emailVerified} as User);// vì useState là bất đồng bộ để như thế này userVerify vấn là false , phải nhấn lần 2 mới là true
      }

      console.log("User reloaded!"+currentUser.emailVerified);
      // Tạo một object copy mới để ép React cập nhật giao diện
  
      console.log("User reloaded! lan 2"+user?.emailVerified);
    }
  };

  return (
    <AuthContext.Provider value={{ user,initializing, login, logout, register, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
