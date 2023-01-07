type tMessage = {
  uuid: string;
  sender: string;
  reciever: string;
  content: string;
};

type tMember = {
  uuid: string;
  name: string;
  avatar?: string;
};

type tUserData = {
  uuid: string;
  name: string;
  email: string;
};

export type { tMember, tMessage, tUserData };
