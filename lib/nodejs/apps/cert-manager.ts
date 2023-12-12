import { Output } from '@pulumi/pulumi';
import { AppRefs } from '../internal/apps';

export class CertManager {
  constructor(private _refs: AppRefs) { }
}
