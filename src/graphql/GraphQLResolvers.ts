import BuildLogResolver from './resolvers/BuildLogResolver';
import BuildLogsResolver from './resolvers/BuildLogsResolver';
import LoginResolver from './resolvers/LoginResolver';
import NodeGroupsResolver from './resolvers/NodeGroupsResolver';
import NodesResolver from './resolvers/NodesResolver';
import VersionResolver from './resolvers/VersionResolver';
import { UserResolvers } from './resolvers/users';
import { PodResolvers } from './resolvers/pods';
import { RegistryResolvers } from './resolvers/registry';
import { AppResolvers } from './resolvers/apps';

const OtherResolvers = {
  Query: {
    version: VersionResolver,
    nodes: NodesResolver,

    buildLogs: BuildLogsResolver,
    buildLog: BuildLogResolver,

    nodeGroups: NodeGroupsResolver,
  },

  Mutation: {
    login: LoginResolver,
  },
};

const GraphQLResolvers = [OtherResolvers, AppResolvers, UserResolvers, PodResolvers, RegistryResolvers];
export default GraphQLResolvers;