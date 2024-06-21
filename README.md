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

### available `grunt` tasks:
- `verbose` - flag, make all tasks be verbose.
- `dry` - flag, dont produce any side effects.
- `force` - flag, allow uploading a failed build.

- `build` - equivalent to all build tasks: `screepsify`; "built" code is stored in `./dist/`.
- `screepsify`: ***!!! not-implemented !!!***
    - flatten folder modules.
    - replace extension: `*.cjs` -> `*.js`.
    - update `require()`s in all files.

- `branch:<branch>` - set target branch for `upload`.
- `upload` - upload the code currently in `./dist/` onto the set branch (default: `dev`).

- `deploy:<branch>` - equivalent to: `build branch:<branch> upload`.

