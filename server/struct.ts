export interface AccountPermissions {
  owner: boolean;
}
export interface Account {
  username: string;
  password: string;
  authToken: string;
  permissions: AccountPermissions;
}

export const defaultPermissions: AccountPermissions = {
  owner: false,
};
