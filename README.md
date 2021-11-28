# do.js
Node.js - Menu interface to Serve/Build nx.dev monorepo apps (Angular and Nest.js) - based on nx.json and tags, uses spinnies prompts and child_processes

0. *Important 

- all apps bust have the envs/configs on workspace.json or others  (angular.json if FE only)
- all apps must have 'fe' and or 'be' as tags on nx.json
- u must install the 3 dependencies :)

1. Setup / Run

- Add to package.json npm hooks as you wish:
```` 
 "scripts": {
    "start": "nx serve",
    "build": "node do.js",
    "do": "node do.js"
  },
```` 

- Run
```` 
node do.js
npm run do
npm run build
...
```` 

2. Menus (example)

```` 
? What to do? » - Use arrow-keys. Return to submit.
>   1. Serve/Run
    2. Build
```` 
```` 
√ What to do? » 1. Serve/Run
? What type of app? » - Use arrow-keys. Return to submit.
>   1. Angular (Frontend/UI)
    2. Nest.js (Backend)
```` 
```` 
√ What to do? » 1. Serve/Run
√ What type of app? » 1. Angular (Frontend/UI)
? What environment? » - Use arrow-keys. Return to submit.
>   1. Dev
    2. Prod
```` 
```` 
√ What to do? » 1. Serve/Run
√ What type of app? » 1. Angular (Frontend/UI)
√ What environment? » 1. Dev
? What application? » - Use arrow-keys. Return to submit.
>   1: app1
    2: app2
```` 

3. Results (examples)

```` 
Ok, lets serve app1 with development configs...

⠋ Building app 'app1' to development...
```` 
```` 
✓ [Nest] 10832  - 15/11/2021 14:21:15     LOG Listening at http://localhost:3000/

⠙ Serving and watching changes...
```` 
```` 
** Angular Live Development Server is listening on localhost:4201, open your browser on http://localhost:4200/ **    

✓  Compiled successfully.        

⠦ Serving and watching changes...
```` 
```` 
Ok, lets build api with development configs...

✖ Something went wrong when building api to development :(
Child process exited with code 1
```` 
```` 
Ok, lets build api with production configs...

✓ Build of app 'api' to production was done!
Child process exited with code 0
```` 
