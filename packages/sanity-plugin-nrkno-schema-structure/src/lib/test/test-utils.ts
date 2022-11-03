import {
  createWorkspaceFromConfig,
  CurrentUser,
  SanityClient,
  SchemaPluginOptions,
  SingleWorkspace,
  Source,
  Workspace,
} from 'sanity';
import { createMockSanityClient } from './mockSanityClient';

const defaultMockUser: CurrentUser = {
  id: 'a',
  name: 'A',
  email: 'A@b.c',
  role: 'admin',
  roles: [{ name: 'administrator', title: 'Administrator' }],
};

const defaultMockSchema: SchemaPluginOptions = {
  name: 'mock',
  types: [],
};

const defaultMockConfig: SingleWorkspace = {
  projectId: 'mock-project-id',
  dataset: 'mock-data-set',
  schema: defaultMockSchema,
};

export interface MockWorkspaceOptions {
  config?: Partial<SingleWorkspace>;
  client?: SanityClient;
  currentUser?: CurrentUser;
}

export async function getMockSource(options: MockWorkspaceOptions = {}): Promise<Source> {
  globalThis.window = {} as any;
  const workspace = await getMockWorkspace(options);
  return workspace.unstable_sources[0];
}

export function getMockWorkspace({
  config: userConfig,
  currentUser = defaultMockUser,
  client = createMockSanityClient() as unknown as SanityClient,
}: MockWorkspaceOptions = {}): Promise<Workspace> {
  const getClient = () => client;
  return createWorkspaceFromConfig({ ...defaultMockConfig, ...userConfig, currentUser, getClient });
}
