# THECLUSTER Modified Stacks Action

Sets output variables for each stack under /clusters and /apps

## Troubleshooting

If the "Validate Modified Stacks" action is failing, but running `npm run build` locally does not produce any changes, make sure to run `npm ci` because it is likely the version of `ncc` in `node_modules` on your local machine is out of date, while CI will always pull the version from the lockfile.
