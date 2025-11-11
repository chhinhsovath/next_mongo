import 'next-auth';
import { UserRole } from './index';

declare module 'next-auth' {
  interface User {
    user_id: string;
    employee_id: string;
    username: string;
    role: UserRole;
  }

  interface Session {
    user: {
      user_id: string;
      employee_id: string;
      username: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user_id: string;
    employee_id: string;
    role: UserRole;
  }
}
