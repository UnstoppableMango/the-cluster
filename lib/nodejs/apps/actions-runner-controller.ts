import { Refs } from '../internal';

export class ActionsRunnerController {
  public namespace = this._refs.actionsRunnerController.requireOutput('namespace');
  public serviceAccount = this._refs.actionsRunnerController.requireOutput('serviceAccount');
  constructor(private _refs: Refs) {}
}
