export const spinnerOptions = { interval: 200, frames: ['♺', '♲', '♻', '♲'] };
// '♻️';

export const promptStepOne = [
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
      { title: '2. Prod', value: 'production' },
      { title: '3. Android (lookpback emulator)', value: 'android' }
    ],
    initial: 0
  }
];

export const promptStepTwo = {
  type: 'select',
  name: 'name',
  message: 'What application?',
  initial: 0
};

export const spinDefault = {
  succeedColor: 'greenBright',
  failColor: 'redBright',
  color: 'white',
  status: 'spinning'
};
