import { ComponentResource, ComponentResourceOptions, interpolate } from '@pulumi/pulumi';
import { Group, GroupRoles, Role } from '@pulumi/keycloak';
import { AudienceProtocolMapper, Client, ClientOptionalScopes } from '@pulumi/keycloak/openid';
import { redirectUris } from '@unstoppablemango/thecluster/apps/keycloak';
import { OAuthApplicationArgs } from './types';

export class OAuthApplication extends ComponentResource {
  public readonly client: Client;
  public readonly mapper: AudienceProtocolMapper;
  public readonly loginRole: Role;
  public readonly readersGroup: Group;
  public readonly readersGroupRoles: GroupRoles;
  public readonly optionalScopes: ClientOptionalScopes;

  constructor(name: string, args: OAuthApplicationArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:OAuthApplication', name, args, opts);

    const client = new Client(name, {
      realmId: args.realmId,
      enabled: args.enabled ?? true,
      name: args.name,
      clientId: args.clientId ?? name,
      accessType: 'CONFIDENTIAL',
      standardFlowEnabled: true,
      directAccessGrantsEnabled: false,
      baseUrl: args.baseUrl,
      validRedirectUris: redirectUris(args.hosts),
    }, { parent: this });
    
    const mapper = new AudienceProtocolMapper(name, {
      realmId: args.realmId,
      name: interpolate`aud-mapper-${client.clientId}`,
      clientId: client.id,
      includedClientAudience: client.clientId,
      addToIdToken: true,
      addToAccessToken: true,
    }, { parent: this });
    
    const loginRole = new Role(`${name}-login`, {
      realmId: args.realmId,
      clientId: client.id,
      name: `${name}-login`,
      description: interpolate`${args.name} Login`,
    }, { parent: this });
    
    const readersGroup = new Group(`${name}-readers`, {
      realmId: args.realmId,
      name: interpolate`${args.name}Readers`.apply(x => x.replace(' ', '')),
      // Something is weird here
      // parentId: pulumi.output(groups).apply(g => g['Web App Readers']),
    }, { parent: this });
    
    const readersGroupRoles = new GroupRoles(`${name}-readers`, {
      realmId: args.realmId,
      groupId: readersGroup.id,
      roleIds: [loginRole.id],
    }, { parent: this });
    
    const optionalScopes = new ClientOptionalScopes(name, {
      realmId: args.realmId,
      clientId: client.id,
      optionalScopes: ['groups'], // TODO: Pull from args?
    }, { parent: this });

    this.client = client;
    this.mapper = mapper;
    this.loginRole = loginRole;
    this.readersGroup = readersGroup;
    this.readersGroupRoles = readersGroupRoles;
    this.optionalScopes = optionalScopes;
    
    this.registerOutputs({
      client, mapper, loginRole,
      readersGroup, readersGroupRoles,
      optionalScopes,
    });
  }
}
