# app-params

A CLI parameter parsing utility for Node.js applications. Define a params template and parse command-line arguments with validation, sub-parameters, and built-in help output.

This project uses [multicolor](https://github.com/jmoleiro/multicolor), to output colored content.

## Install

```bash
npm install @j_moleiro/app-params
```

## Usage

```js
var exit = require('process').exit;
const app = require('@j_moleiro/app-params')({
  name: 'My App',
  version: '1.0.0',
  description: 'Does something useful',
  usage: 'my-app [options]',
  no_auto_print_help: false,
  color_scheme:{
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
      description: 'Specify an addon slug to pack',
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
```

## Application definition template

|Field|Type|Description|
|----|----|----|
|name|`string`|Application Name|
|version|`string`|Application version|
|description|`string`|Application description|
|usage|`string`|String explaining the basic commandline usage|
|no_auto_print_help|`bool`|Indicates if the app disables the automatic print help and exit behaviour if no parameters where provided.|
|color_scheme|`array`|Each possible entry contains an array of the available color modifiers available.Check the [Color Scheme parameters](#color-scheme-parameters) for a complete list of entries expected.|
|params_template|`array`|Array of parameters templates. See the  table for [Params Template](#params-template), for a comprehensive list of values|


## Color Scheme parameters

You can replace the default values by adding one of the following entries.

|Name|Usage|Default|
|-|-|-|
|`application_name`|Color for the application name|`['blue', 'bold']`|
|`application_version`|Color for the application version|`['green']`|
|`label`|Used for labels|`['blue']`|
|`usage`|Used for the usage instructions|`['bold']`|
|`param_name`|Used to display the parameter name|`['yellow']`|
|`param_extra`|Used to display parameters extra information|`['bold']`|
|`error`|Used to display errors|`['red', 'bold']`|
|`error_extra`|Used to display error's extra information|`['bold']`|

These color modifiers allowed can be reviewed [multicolor](https://github.com/jmoleiro/multicolor#color-scheme-parameters) documentation.

## Params Template

Each param entry supports:

| Field | Type | Description |
|-------|------|-------------|
| `slug` | `string` | Identifier used to reference the param |
| `option` | `string[]` | CLI flags (e.g. `['--addon', '-a']`) |
| `followed_by_value` | `boolean` | Requires a value argument after the flag |
| `value_allowed` | `boolean` | Optionally accepts a value argument |
| `description` | `string` | Shown in help output |
| `required` | `boolean` | Whether the param is required |
| `required_if` | `string[]` | Param slugs that make this one required |
| `hidden` | `boolean` | Hides the param from help output |

## Methods

### `get_param(slug, template?, default?)`
Returns `{ value, valid }` for the given param slug, or `default` if not found.

#### Parameters

- `slug`: The slug of the parameter
- `template`: (Optional) The default value is the `params_template` field of the [Application definition](#application-definition-template). You can send your own array of parameters if you wish or an empty object(`{}`) to fallback to application definition.
- `default`: (Optional) The default value is an empty string. You can specify a custom default value if you wish.

### `list_params(template?)`
Returns an object mapping each found param slug to its `{ value, valid }`.

#### Parameters

- `template`: (Optional) The default value is the `params_template` field of the [Application definition](#application-definition-template).


### `is_param(slug, template?)`
Returns `true` if the param is present and valid (including all required sub-params).

#### Parameters

- `slug`: The slug of the parameter
- `template`: (Optional) The default value is the `params_template` field of the [Application definition](#application-definition-template). You can send your own array of parameters if you wish or an empty object(`{}`) to fallback to application definition.

### `param_count(template?)`
Returns the number of params found (regardless of validity).

#### Parameters

- `template`: (Optional) The default value is the `params_template` field of the [Application definition](#application-definition-template). 

### `valid_param_count(template?)`
Returns the number of valid params found.

#### Parameters

- `template`: (Optional) The default value is the `params_template` field of the [Application definition](#application-definition-template). 

### `print_help()`
Prints formatted help text to stdout based on the params template.

### `print_app()`
Prints the app name and version to stdout.

### `print_invalid_params()`
Prints validation errors for any invalid or missing params.

## License

[MIT](LICENSE) License

Copyright (c) 2026


