import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import GraphQLResolvers from './graphql/GraphQLResolvers';
import GraphQLTypeDefs from './graphql/GraphQLTypeDefs';
import http from 'http';
import setupApis from './apis';
import { KubepiterUser } from './types/common';
import { getBuildManager } from './k8s/ImageBuilderManager';
import getDatabaseConnection from './drivers/databases/DatabaseInstance';
import KubeMetric from './k8s/KubeMetric';
import { getKuberneteApi, getKuberneteCore, getKuberneteNetwork, getKuberneterConfig } from './k8s/getKubernete';
import parseTokenFromRequest from './libs/parseTokenFromRequest';
import { Environment } from './Environment';
import GraphContext from './types/GraphContext';

const buildManager = getBuildManager();
const metricManager = new KubeMetric(getKuberneterConfig(), getKuberneteCore());

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: GraphQLTypeDefs,
    resolvers: GraphQLResolvers,
    csrfPrevention: true,

    context: async ({ req }) => {
      const db = getDatabaseConnection();
      const token = parseTokenFromRequest(req);

      let user: KubepiterUser | undefined;
      if (token) {
        const userId = await db.getUserToken(token as string);

        if (userId) {
          user = await db.getUserById(userId.userId);
        }
      }

      return {
        db,
        user,
        buildManager,
        metricManager,

        // Kube
        k8Api: getKuberneteApi(),
        k8Core: getKuberneteCore(),
        k8Network: getKuberneteNetwork(),
      } as GraphContext;
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
  });

  setupApis(app);

  httpServer.listen({ port: Environment.PORT || 80 });
}

startServer().then(() => {
  // eslint-disable-next-line no-console
  console.log('Starting server');
});
