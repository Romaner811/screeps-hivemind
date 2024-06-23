# HiveMind

Task and agenda oriented code for screeps world.

* trello:  <https://trello.com/b/b3zBUYbv/screeps>



## Setup:

0. install git, sourcetree, node.
1. make ssh key and add it to github.
1. $ `git clone git@github.com:Romaner811/screeps-hivemind.git`
1. $ `cd screeps-hivemind`
1. $ `npm install --global grunt-cli`
1. $ `npm install`
1. if you dont have access to the original auth-token you'll need to create one: <https://screeps.com/a/#!/account/auth-tokens>
1. create the secret auth file: `./screeps.auth.secret`
```json
{
    "email": "your@email.com",
    "token": "******-****-****-****-************"
}
```



## Commit:

1. ensure you have `./screeps.auth.secret` ready.
2. $ `grunt deploy:<branch>`
    * branch - where to deploy.
3. grunt will create a screepsified version at `./dist/` and upload it to the account specified in the secret file.

### Available tasks:
> ##### note:
> $ `grunt --help`
> will print a more up-to-date version.
> note: dont use `screeps` task directly, see `upload` instead.

##### flags:
- `verbose` - config flag, make all tasks be verbose.
- `dry` - config flag, dont produce any side effcts.
- `force` - config flag, allow uploading a failed build.
##### build:
- `build` - equivalent to all build tasks. "built" code is stored in `./dist/`.
    - `screepsify`: rearrange the code for screeps
        - flatten folder modules.
        - replace extension: `*.cjs` -> `*.js`.
        - update `require()`s in all files.
##### upload:
- `branch:<branch>` - config, set target branch for `upload`.
- `upload` - upload the code currently in `./dist/` onto the set branch (default: `dev`).
    _**note:** use this instead of `screeps` task._
- `deploy:<branch>` - `build` then `upload`. equivalent to: `build branch:<branch> upload`.

### examples:
- $ `grunt dry upload`
    write the default branch.
- $ `grunt dry verbose build`
    output the verbose logs for build but without actually building.
- $ `grunt branch:something upload`
    upload any built code from `./dist/` into branch `something`.

