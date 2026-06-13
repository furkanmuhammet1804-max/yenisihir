export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Gallery: { mode: 'own' | 'demos' };
  Assistant: undefined;
  SystemTest: undefined;
  Detail: { videoId: string };
  Editor: { videoId?: string };
  Perform: { videoId: string };
  Share: { videoId: string };
  Paywall: { videoId?: string };
  Settings: undefined;
  IndexLists: undefined;
};
