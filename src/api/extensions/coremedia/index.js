import {Router} from 'express';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {createHttpLink} from 'apollo-link-http';

import fetch from 'cross-fetch';
import {Agent} from 'https';

import allSitesQuery from './graphql/allSites.gql';
import bannerQuery from './graphql/banner.gql';
import categoryFragmentsQuery from './graphql/categoryFragments.gql';
import homeGridQuery from './graphql/homeGridQuery.gql';

module.exports = ({ config }) => {
  const IntrospectionFragmentMatcher = require('apollo-cache-inmemory').IntrospectionFragmentMatcher;
  const introspectionQueryResultData = require('./fragmentTypes');
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  });

  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: config.extensions.coremedia.apiUrl,
      fetch: fetch,
      fetchOptions: {
        agent: new Agent({ rejectUnauthorized: false })
      }
    }),
    cache: new InMemoryCache({fragmentMatcher}),
    defaultOptions: {
      query: {
        // TODO: Enable caching
        fetchPolicy: 'no-cache'
      }
    }
  });

  const api = Router();

  function performQuery (query, queryVars, req, res) {
    apolloClient.query({
      query: query,
      variables: queryVars
    })
      .then(data => {
        res.status(200).json(data);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  }

  api.get('/previewurl', (req, res) => {
    res.status(200).send(config.extensions.coremedia.previewUrlPattern);
  });

  api.get('/sites', (req, res) => {
    performQuery(allSitesQuery, null, req, res);
  });

  api.get('/banner/:id', (req, res) => {
    performQuery(bannerQuery, {contentId: req.params.id}, req, res);
  });

  api.get('/category/fragments', (req, res) => {
    performQuery(categoryFragmentsQuery, null, req, res);
  });

  api.get('/homegrid/:siteId', (req, res) => {
    performQuery(homeGridQuery, {id: req.params.siteId}, req, res);
  });

  return api;
};
