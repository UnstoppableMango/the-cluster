import { Output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';
import * as internal from '../internal';
import * as cluster from '../cluster';

export class System {
  public ref = cluster.ref(this._cluster);
  public kubeconfig = this.ref.requireOutput('kubeconfig') as Output<string>;
  public provider = new Provider(this._cluster, { kubeconfig: this.kubeconfig });
  public refs = new internal.Refs(this._cluster);
  public apps = new internal.Apps(this.refs);
  public bundles = new internal.Bundles(this.apps);
  public clusterIssuers = new internal.ClusterIssusers(this.apps);
  public databases = new internal.Databases(this.refs, this.apps);
  public dns = new internal.Dns(this.apps);
  public identities = new internal.Identities(this.apps);
  public ingresses = new internal.Ingresses(this.apps);
  public issuers = new internal.Issuers(this.apps);
  public loadBalancers = new internal.LoadBalancers(this.apps);
  public realms = new internal.Realms(this.refs, this.apps);
  public shared = new internal.Shared(this._cluster);
  public storage = new internal.Storage(this._cluster);
  public storageClasses = new internal.StorageClasses(this.apps);

  constructor(private _cluster: string) { }
}
