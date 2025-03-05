export interface CreateOktaUserDto {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    login: string;
  };
}

export interface CreateOktaUserResponseDto {
  id: string;
  status: 'STAGED' | 'ACTIVE';
  created: Date | null;
  activated: boolean | null;
  statusChanged: boolean | null;
  lastLogin: Date | null;
  lastUpdated: Date;
  passwordChanged: boolean | null;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    login: string;
    mobilePhone?: string;
  };
  credentials: {
    provider: {
      type: 'OKTA';
      name: 'OKTA';
    };
  };
  _links: {
    activate: {
      href: string;
    };
    self: {
      href: string;
    };
  };
}
