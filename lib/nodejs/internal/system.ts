import { Output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';
import { Refs, Apps, Databases, Ingresses, LoadBalancers, StorageClasses, Dns, Identities, ClusterIssusers, Realms } from '../internal';
import * as cluster from '../cluster';

export class System {
  public ref = cluster.ref(this._cluster);
  public kubeconfig = this.ref.requireOutput('kubeconfig') as Output<string>;
  public provider = new Provider(this._cluster, { kubeconfig: this.kubeconfig });
  public refs = new Refs(this._cluster);
  public apps = new Apps(this.refs);
  public clusterIssuers = new ClusterIssusers(this.apps);
  public databases = new Databases(this.apps);
  public dns = new Dns(this.apps);
  public identities = new Identities(this.apps);
  public ingresses = new Ingresses(this.apps);
  public loadBalancers = new LoadBalancers(this.apps);
  public realms = new Realms(this.refs, this.apps);
  public storageClasses = new StorageClasses(this.apps);

  constructor(private _cluster: string) { }
}
