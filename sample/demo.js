var exit = require('process').exit;
const app = require("@j_moleiro/app-params")({
  name: 'My App',
  version: '1.0.0',
  description: 'Does something useful',
  usage: 'my-app [options]',
  no_auto_print_help: false,
  color_scheme: {
      application_name: ['blueBright', 'bold'],
      application_version: ['green', 'underline']
  },
  params_template: [
    {
      slug: 'addon',
      option: ['--addon', '-a'],
      followed_by_value: true,
      description: 'Specify an addon slug to pack',
      required: false,
      hidden: false
    },
    {
      slug: 'force',
      option: ['--force', '-f'],
      followed_by_value: false,
      description: 'Force overwrite addon data file.',
      required: false,
      child_of: ['addon'],
      hidden: false
    },
    {
      slug: 'help',
      option: ['--help', '-h'],
      followed_by_value: false,
      description: 'Show help',
      hidden: false
    }
  ]
});

if ((app.param_count() === 0) || app.is_param('help')) {
    app.print_help()
    exit(0);
}

app.print_app()

// Check if a param is present
if (app.is_param('addon')) {
  const addon = app.get_param('addon');
  console.log('Addon:', addon.value);
  if (app.is_param('force')) {
    console.log('Force overwrite enabled');
  }
}

if (app.valid_param_count() === 0)
{
    app.print_invalid_params()
    exit(-1);
}