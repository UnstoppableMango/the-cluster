import { Output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';
import { AppRefs, Apps, Databases, Ingresses, LoadBalancers, StorageClasses } from '../internal';
import * as cluster from '../cluster';

export class System {
  public kubeconfig = cluster.ref(this._cluster).requireOutput('kubeconfig') as Output<string>;
  public provider = new Provider(this._cluster, { kubeconfig: this.kubeconfig });
  public appRefs = new AppRefs(this._cluster);
  public apps = new Apps(this.appRefs);
  public ingresses = new Ingresses(this.apps);
  public storageClasses = new StorageClasses(this.apps);
  public databases = new Databases(this.apps);
  public loadBalancers = new LoadBalancers(this.apps);

  constructor(private _cluster: string) { }
}
