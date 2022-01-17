const fs = require('fs');
const prompts = require('prompts');
const Spinnies = require('spinnies');
const exec = require('child_process').exec;

const help = require('./help');
const constants = require('./const');

const { promptStepOne, promptStepTwo, spinDefault } = constants;
const spinnerOptions = { interval: 200, frames: ['♺', '♲', '♻', '♲'] };
// '♻️';
const { getEnv, write, writeEnv } = help;

const spinnies = new Spinnies({ spinnerOptions });

const rawdata = fs.readFileSync('nx.json');
const nx = JSON.parse(rawdata);

const feApps = help.getApps(nx.projects, 'fe');
const beApps = help.getApps(nx.projects, 'be');

let actionSpin;
let dataSpin;

const uglyClose = (data, app, response, code, spin) => {
  if (data === 0) {
    process.stdout.write(`Child process uglify exited with code ${data}\n`);
    spinnies.succeed(spin, {
      text: ` Build of app '${app.name}' to ${response.env} was done!`
    });
    if (code === 0 && data === 0) {
      spinnies.succeed('action', {
        text: ' All done !'
      });
    } else {
      process.stdout.write(
        `Something went wrong when building ${app.name} to ${response.env} :(\n`
      );
    }
  } else {
    process.stdout.write(
      `Something went wrong when building ${app.name} to ${response.env} :(\n`
    );
  }
  spinnies.stopAll('succeed');
  return;
};

const uglyOutData = (data) => {
  if (data.includes('Compressing and mangling the file')) {
    const fn = data.toString().split('.js');
    const id = fn[0].substring(fn[0].length - 25, fn[0].length);
    const spin = spinnies.pick(id);
    if (!spin) {
      console.clear();
      spinnies.add(id, {
        ...spinDefault,
        spinnerColor: 'cyanBright',
        text: ` ${data.substring(0, data.length - 1)}`
      });
    }
  }
};

const uglyErrData = (data, ugly) => {
  if (ugly.stdout.readable) ugly.stdout.unpipe();
  if (data.includes('Compressing and mangling the file')) {
    const fn = data.toString().split('.js');
    const id = fn[0].substring(fn[0].length - 25, fn[0].length);
    const spin = spinnies.pick(id);
    if (!spin) {
      console.clear();
      spinnies.add(id, {
        ...spinDefault,
        spinnerColor: 'cyanBright',
        text: ` ${data.substring(0, data.length - 1)}`
      });
    }
  }
};

const commandClose = (code, app, response) => {
  process.stdout.write(
    `Child process ${response.action} exited with code ${code}`
  );
  const spin = dataSpin ? 'data' : 'action';
  if (code === 0) {
    const ugly = exec(`node dist/apps/${app.name}/pt/uglify.js`);
    console.clear();
    actionSpin = spinnies.update(spin, {
      text: ' Compressing and mangling the files...'
    });
    ugly.on('close', (data) => uglyClose(data, app, response, code, spin));
    ugly.stdout.on('data', (data) => uglyOutData(data));
    ugly.stderr.on('data', (data) => uglyErrData(data, ugly));
  } else {
    spinnies.fail(spin, {
      text: ` Something went wrong when building ${app.name} to ${response.env} :(\n`
    });
  }
};

const commandOutData = (data) => {
  if (data.includes('Compiled successfully')) {
    console.clear();
    actionSpin = spinnies.update('data', {
      text: ' Serving and watching changes...'
    });
    const timer = setTimeout(() => {
      console.clear();
      actionSpin = spinnies.succeed('action', {
        text: ' ' + data.substring(2, data.length)
      });
      clearInterval(timer);
      process.stdout.write(this.serveMsg);
    }, 200);
  }
  if (data.includes('Angular')) {
    this.serveMsg = `> ${data.substring(3, data.length - 1)}`;
  }
  if (data.includes('[Nest]')) {
    if (data.includes('Listening at')) {
      process.stdout.write('\n');
      actionSpin = spinnies.succeed('action', {
        text: ' ' + data
      });
      dataSpin = spinnies.update('data', {
        text: ' Serving and watching changes...'
      });
    } else process.stdout.write(`${data.substring(37, 200)}`);
  }
};

const commandErrData = (data, response) => {
  if (!dataSpin && response.type === 'fe') {
    dataSpin = spinnies.add('data', {
      ...spinDefault,
      spinnerColor: 'greenBright',
      text: actionSpin.text
    });
  } else if (!dataSpin && response.type === 'be') {
    dataSpin = spinnies.add('data', {
      ...spinDefault,
      spinnerColor: 'greenBright',
      text: actionSpin.text
    });
    const timer = setTimeout(() => {
      actionSpin = spinnies.update('action', {
        text: ' Finishing initialization...'
      });
      clearInterval(timer);
    }, 100);
  }
  if (data[0] === '✔' || data[0] === '-') {
    actionSpin = spinnies.update('action', {
      text: ' ' + data.substring(2, data.length)
    });
  }
  if (data.includes('Error:')) {
    const timer = setTimeout(() => {
      actionSpin = spinnies.fail('action', {
        text: ' Something went wrong! See error detail above...'
      });
      clearInterval(timer);
      process.stdout.write(`\n${data}`);
    }, 200);
  }
};

const commandErr = (data) => {
  process.stdout.write('err', data);
};

// FUNCS

(async () => {
  console.clear();

  const response = await prompts(promptStepOne);

  const apps = response.type === 'fe' ? feApps : beApps;

  const app = await prompts([
    {
      ...promptStepTwo,
      choices: apps
    }
  ]);

  if (app.name && response.type && response.env && response.action) {
    console.clear();
    process.stdout.write(
      `Ok, lets ${response.action} ${app.name} with ${response.env} configs...\n\n`
    );

    if (response.type === 'fe') {
      actionSpin = spinnies.add('action', {
        ...spinDefault,
        spinnerColor: 'magentaBright',
        text: ` Copying dotenv to Angular ts environmets....`
      });
      let path = '';
      if (response.env === 'production') path = 'env/local.env';
      else path = 'env/android.local.env';
      require('dotenv').config({ path });
      const wrote = await writeEnv(
        process.env.API_BASE,
        process.env.PORT_GTW_VERSO,
        process.env.PORT_GTW_PAPO
      ).then((res) => res);

      if (!wrote) {
        actionSpin = spinnies.fail('action', {
          text: ' Something went wrong! See error detail above...'
        });
        return;
      } else {
        actionSpin = spinnies.update('action', {
          ...spinDefault,
          spinnerColor: 'magentaBright',
          text: ` Building app '${app.name}' to ${response.env}...`
        });
      }
    } else {
      actionSpin = spinnies.add('action', {
        ...spinDefault,
        spinnerColor: 'magentaBright',
        text: ` Building app '${app.name}' to ${response.env}...`
      });
    }

    const command = exec(
      // `ls`
      `npx nx run ${app.name}:${response.action}:${response.env}`
    );
    command.on('close', (data) => commandClose(data, app, response));
    command.stdout.on('data', (data) => commandOutData(data));
    command.stderr.on('data', (data) => commandErrData(data, response));
    command.stderr.on('error', (data) => commandErr(data));
  } else {
    return;
  }
})();
