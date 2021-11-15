(async () => {
  console.clear();
  const fs = require('fs');
  const prompts = require('prompts');
  const Spinnies = require('spinnies');
  const spinnies = new Spinnies();
  const exec = require('child_process').exec;

  const rawdata = fs.readFileSync('nx.json');
  const nx = JSON.parse(rawdata);
  const feApps = [];
  const beApps = [];

  for (const [key, value] of Object.entries(nx.projects)) {
    if (
      value &&
      value.tags &&
      value.tags.findIndex((tag) => {
        return tag === 'fe';
      }) >= 0
    ) {
      const num = feApps.length + 1;
      feApps.push({ title: num + ': ' + key, value: key });
    }
    if (
      value &&
      value.tags &&
      value.tags.findIndex((tag) => {
        return tag === 'be';
      }) >= 0
    ) {
      const num = beApps.length + 1;
      beApps.push({ title: num + ': ' + key, value: key });
    }
  }

  const response = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What to do?',
      choices: [
        { title: '1. Serve/Run', value: 'serve' },
        { title: '2. Build', value: 'build' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'type',
      message: 'What type of app?',
      choices: [
        { title: '1. Angular (Frontend/UI)', value: 'fe' },
        { title: '2. Nest.js (Backend)', value: 'be' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'env',
      message: 'What environment?',
      choices: [
        { title: '1. Dev', value: 'development' },
        { title: '2. Prod', value: 'production' }
      ],
      initial: 0
    }
  ]);

  const apps = response.type === 'fe' ? feApps : beApps;

  const app = await prompts([
    {
      type: 'select',
      name: 'name',
      message: 'What application?',
      choices: apps,
      initial: 0
    }
  ]);

  let actionSpin = spinnies.add('action', {
    text: `Building app '${app.name}' to ${response.env}...`
  });

  if (app.name && response.type && response.env && response.action) {
    let dataSpin;
    console.clear();
    process.stdout.write(
      `Ok, lets ${response.action} ${app.name} with ${response.env} configs...\n\n`
    );
    const command = exec(
      `npx nx run ${app.name}:${response.action}:${response.env}`
    );
    command.on('close', (code) => {
      const spin = dataSpin ? 'data' : 'action';
      if (code === 0) {
        spinnies.succeed(spin, {
          text: `Build of app '${app.name}' to ${response.env} was done!`
        });
      } else {
        spinnies.fail(spin, {
          text: `Something went wrong when building ${app.name} to ${response.env} :(`
        });
      }
      if (dataSpin)
        spinnies.succeed('action', {
          text: 'All done !'
        });
      process.stdout.write(`Child process exited with code ${code}`);
    });
    command.stdout.on('data', (data) => {
      if (data.includes('Compiled successfully')) {
        console.clear();
        actionSpin = spinnies.update('data', {
          text: 'Serving and watching changes...'
        });
        const timer = setTimeout(() => {
          console.clear();
          actionSpin = spinnies.succeed('action', {
            text: data.substring(2, data.length)
          });
          clearInterval(timer);
          process.stdout.write(this.serveMsg);
        }, 200);
      }
      if (data.includes('Angular')) {
        this.serveMsg = `${data}`;
      }
      if (data.includes('[Nest]')) {
        if (data.includes('Listening at')) {
          process.stdout.write('\n');
          actionSpin = spinnies.succeed('action', {
            text: data
          });
          dataSpin = spinnies.update('data', {
            text: 'Serving and watching changes...'
          });
        } else process.stdout.write(`${data.substring(37, 200)}`);
      }
    });
    command.stderr.on('data', (data) => {
      if (!dataSpin && response.type === 'fe') {
        dataSpin = spinnies.add('data', {
          text: actionSpin.text
        });
      } else if (!dataSpin && response.type === 'be') {
        dataSpin = spinnies.add('data', {
          text: actionSpin.text
        });
        const timer = setTimeout(() => {
          actionSpin = spinnies.update('action', {
            text: 'Finishing initialization...'
          });
          clearInterval(timer);
        }, 100);
      }
      if (data[0] === '✔' || data[0] === '-') {
        actionSpin = spinnies.update('action', {
          text: data.substring(2, data.length)
        });
      }
      if (data.includes('Error:')) {
        const timer = setTimeout(() => {
          actionSpin = spinnies.fail('action', {
            text: 'Something went wrong! See error detail above...'
          });
          clearInterval(timer);
          process.stdout.write(`\n${data}`);
        }, 200);
      }
    });
    command.stderr.on('error', (data) => {
      process.stdout.write('err', data);
    });
  } else {
    return;
  }
})();
