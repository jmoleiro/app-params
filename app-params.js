var exit = require('process').exit;
var args = process.argv.slice(2);
var app_config = {};
const multicolor = require('@j_moleiro/multicolor');

var default_colors = {
      application_name: ['blue', 'bold'],
      application_version: ['green'],
      label: ['blue'],
      usage: ['bold'],
      param_name: ['yellow'],
      param_extra: ['bold'],
      error: ['red', 'bold'],
      error_extra: ['bold']
};

var params_template_sample = [
    {
        'slug': 'addon',
        'option': ['--addon', '-a'],
        'followed_by_value': true,
        'value_allowed': true,
        'description': 'Specify a single addon slug to pack',
        'required': false,
        'child_of': ['pack']
    }
]

var get_color_scheme = function(color_scheme, application = {}){
    let color_scheme_values = []
    if (Object.keys(application).length === 0){
       if (app_config === undefined){
          app_config = {};
       }
       application = app_config;
    }
    if (application.color_scheme != undefined && application.color_scheme[color_scheme] !== undefined){
        color_scheme_values = application.color_scheme[color_scheme];
    } else {
        if (default_colors[color_scheme] !== undefined){
            color_scheme_values = default_colors[color_scheme];
        }
    }
    return color_scheme_values;
};

function find_param(param_slug, template_args = {}){
   if (Object.keys(template_args).length === 0){
       if (app_config.params_template === undefined){   
          return params;
       }
       template_args = app_config.params_template;
   }
   let param = template_args.find((param) => param['slug'] === param_slug);
   return param;
}

function is_known_option(value, template_args = []) {
    if (value === undefined) {
        return false;
    }
    return template_args.some((param) => {
        return (param['option'] || []).includes(value);
    });
}

function list_params(template_args = {}){ 
   let params = {};
   if (Object.keys(template_args).length === 0){
       if (app_config.params_template === undefined){   
          return params;
       }
       template_args = app_config.params_template;
   }
   if (Object.keys(template_args).length === 0){
       return params;
   }
   args.forEach((arg, index) => {
       template_args.forEach((param) => {
           param['option'].forEach((opt) => {
                if (arg === opt && !param['followed_by_value'] && !param['value_allowed']){
                    params[param['slug']] = {
                            'value': true,
                            'valid': true
                        };
                } else {
                    if (arg === opt && param['followed_by_value']){
                        let next_value = args[index + 1];
                        let value_is_option = is_known_option(next_value, template_args);
                        let value = value_is_option ? '' : next_value;
                        params[param['slug']] = {
                            'value': value || '',
                            'valid': (value !== undefined && value !== '')
                        };
                    } else {
                        if (arg === opt && param['value_allowed']){
                            let next_value = args[index + 1];
                            let value_is_option = is_known_option(next_value, template_args);
                            let value = value_is_option ? '' : next_value;
                            params[param['slug']] = {
                                'value': value || '',
                                'valid': true
                            };
                        }
                    }
                }

           })
       });
   });
   return params;
}

function get_param(param_slug, template_args = {}, default_value = ''){
   if (Object.keys(template_args).length === 0){
       if (app_config.params_template === undefined){   
          app_config.params_template = {}
       }
       template_args = app_config.params_template;
   }
    let params = list_params(template_args);      
    if(params[param_slug] !== undefined){
        return params[param_slug];
    } else {
        return default_value;
    }
}

function print_app(application = {}){
   if (Object.keys(application).length === 0){
       if (app_config === undefined){   
          app_config = {}
       }
       application = app_config;
   }
   if (Object.keys(application).length === 0) {
         console.log(multicolor("Application configuration not available.", get_color_scheme('error')));
         exit(-1);
   }
//    console.log(chalk.blue.bold(application.name || "Application"));
   console.log(multicolor(multicolor(application.name || "Application", get_color_scheme('application_name')) + ' ' + multicolor(('v' + application.version || ""), get_color_scheme('application_version')) + '\n'));
}

function print_help(application = {}){    
    if (Object.keys(application).length === 0){
       if (app_config === undefined){   
          app_config = {}
       }
       application = app_config;
    }
    if (Object.keys(application).length === 0){
         console.log(multicolor("Application configuration not available.", get_color_scheme('error')));
         exit(-1);
    }    
    console.log(multicolor(application.name || "Application", get_color_scheme('application_name')) + ' ' + multicolor(('v' + application.version || ""), get_color_scheme('application_version')) + '\n');
    console.log((application.description || "Description not available.") + '\n');
    if (application.usage !== undefined && application.usage !== '') {
        console.log(multicolor("Usage: ", get_color_scheme('label')) + multicolor(application.usage || "Usage information not available.", get_color_scheme('usage')) + '\n');    
    }
    if (application.params_template === undefined || application.params_template.length === 0) {
        console.log(multicolor("No parameters available.", get_color_scheme('error')));
    } else {
        console.log(multicolor("Available options:\n", get_color_scheme('label')));
        application.params_template.forEach((param) => {
            print_param_data(param, application);
        });
    }
    console.log('\n');
}

var print_param_data = function(param, application = {}){
    if (param.hidden) {
        return;
    }
    let options_str = param['option'].join(', ');
    let param_p = ""
    if (param['child_of'] == undefined || param['child_of'].length == 0) {
        if ((param['followed_by_value'] == true) || (param['value_allowed'] == true)) {
            param_p = (param['followed_by_value'] == true) ? " <value>" : " [<value>]";
        }
        let extra = ""
        let extra_data = ""
        application.params_template.forEach((sub_param) => {
            if (sub_param['child_of'] !== undefined && sub_param['child_of'].length > 0) {
                if (sub_param['child_of'].includes(param['slug'])) {
                    extra += ' [' + sub_param['option'][0];
                    let extra_p = ""
                    if ((sub_param['followed_by_value'] == true) || (sub_param['value_allowed'] == true)) {
                        extra += ' ' + ((sub_param['followed_by_value'] == true) ? " <value>" : " [<value>]");
                        extra_p = (sub_param['followed_by_value'] == true) ? " <value>" : " [<value>]";
                    }
                    extra += '] '

                    extra_data += "\t" + multicolor(sub_param['option'].join(', '), get_color_scheme('param_name')) + multicolor(extra_p, get_color_scheme('param_extra')) + '\n';
                    extra_data += "\t" + sub_param['description'] + '\n';
                }
            }
        });
        console.log(multicolor(options_str, get_color_scheme('param_name')) + multicolor(param_p, get_color_scheme('param_extra')) + extra);
        // console.log('  ' + param['description'] + '\n');
        console.log('  ' + param['description']);
        if (extra_data !== "") {
            console.log('\n  ' + multicolor('Sub-parameters:', get_color_scheme('param_extra')));
            console.log(extra_data);
        }
        //Search for subparams

    }
}    

var param_count = function(template_args = {}) {
   let params = list_params(template_args);  
   return Object.keys(params).length;
}

var get_required_subparams = function(param_slug, template_args = {}) {
   if (Object.keys(template_args).length === 0){
       if (app_config.params_template === undefined){
          return [];
       }
       template_args = app_config.params_template;
   }
   return template_args.filter((param) => {
       let child_of = param['child_of'] || [];
       return param['required'] === true && child_of.includes(param_slug);
   });
}

var has_required_subparams = function(param_slug, params, template_args = {}) {
    let required_subparams = get_required_subparams(param_slug, template_args);
    for (let i = 0; i < required_subparams.length; i++) {
        let sub_param = required_subparams[i];
        if (params[sub_param['slug']] === undefined || params[sub_param['slug']]['valid'] !== true) {
            return false;
        }
    }
    return true;
}

var is_param = function(param_slug, template_args = {}) {
   let params = list_params(template_args);  
   let is_p = params[param_slug] !== undefined;
   if (is_p) {
         if (params[param_slug]['valid'] !== true) {
            return false;
         }
         return has_required_subparams(param_slug, params, template_args);
   }
   return is_p;
}

var valid_param_count = function(template_args = {}) {
    let params = list_params(template_args);
    let valid_count = 0;
    Object.keys(params).forEach((param_slug) => {
        if (is_param(param_slug, template_args) === true) {
            valid_count += 1;
        }
    });
    return valid_count;
}

var print_invalid_params = function(template_args = {}, application = {}) {
    if (Object.keys(application).length === 0) {
       if (app_config === undefined){   
          app_config = {}
       }
       application = app_config;
    }    
    let params = list_params(template_args);
    Object.keys(params).forEach((param_slug) => {
        let param = find_param(param_slug, template_args);
        if (params[param_slug]['valid'] !== true) {
            let message = "Invalid parameter: " + multicolor(param_slug, get_color_scheme('error'));
            if ((param.followed_by_value === true) && (params[param_slug]['value'] === '')) {
                message += ": " + multicolor("Missing value for parameter. ", get_color_scheme('error_extra'));
            }
            console.log(message);
            console.log('\nExpected usage: \n');
            print_param_data(param, application);
            return;
        }

        let required_subparams = get_required_subparams(param_slug, template_args);
        let missing_subparams = required_subparams.filter((sub_param) => {
            return params[sub_param['slug']] === undefined || params[sub_param['slug']]['valid'] !== true;
        });

        if (missing_subparams.length > 0) {
            let message = "Invalid parameter: " + multicolor(param_slug, get_color_scheme('error'));
            message += ": " + multicolor("Missing required sub-parameter(s): ", get_color_scheme('error_extra'));
            message += missing_subparams.map((sub_param) => sub_param['slug']).join(', ');
            console.log(message);
            console.log('\nExpected usage: \n');
            print_param_data(param, application);
        }
    });
}

module.exports = function (config) {
    app_config = config || {};
    if ((param_count() == 0) && (app_config.auto_print_help != undefined) && (app_config.auto_print_help == true)) {
        print_help();
        exit();
    }
    return {
        get_param: get_param,
        param_count: param_count,
        valid_param_count: valid_param_count,
        print_invalid_params: print_invalid_params,
        is_param: is_param,
        list_params: list_params,
        print_help: print_help,
        print_app: print_app
    }
}