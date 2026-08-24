// Kubernetes resources for deemix are now managed by Flux (flux/apps/deemix/).
// This stack only provisions the Keycloak client used for oauth2-proxy auth.
export * from './oauth';
