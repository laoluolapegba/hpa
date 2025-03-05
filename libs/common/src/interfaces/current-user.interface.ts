import { $Enums } from '@prisma/client';

export interface ICurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  oktaId: string | null;
  createdAt: Date;
  status: $Enums.UserStatus;
}
