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

export type { tMember, tMessage };
