(function (globals, $, undefined) {
  
  globals.Faux || (globals.Faux = {});
  
  var render_worker = function (task, callback) {
    async.nextTick(function () {
      task.handler(task.data, task.__options__, callback);
    });
  };
  
  var render_queue = async.queue(render_worker, 20);
  
  globals.Faux.Controller = (function () {
      
      // So-called "Macros"
      // ---
      //
      // The following 'macros' write handler steps for you. Each one is a single
      // config property and a function that takes a handler and the value of that config property.
      // if you supply a value for that property, the 'macro' function will be invoked
      // and is expected to perturb the handler as a side-effect.
      //
      // Naturally, you can write your own macros. You can define them across your application:
      //
      //     $.sammy('.body', function() {
      //       this.use(Faux('MyApp', { 
      //         macros: {
      //           part_number: function (handler, num) { ... }
      //         },
      //         ...
      //       }));
      //     });
      //
      // And thereafter, use them in your declarations:
      //
      //     Faux.MyApp
      //       .action(
      //         route: '/increase_inventory',
      //         part_number: 42,
      //       );
      //
      // The macros listed here are the defaults built into Faux.
      //
      // p.s. Yes, 'macro' is an improper term. The longer and more precise expression
      // is 'a function-writing-function', which is a kind of Higher Order Function ("HOF").
      var default_macros = {
        
        // **Display**
        //
        // The `partial` macro writes a `display` step that uses a tenplate of
        // some type (e.g. Haml) to display the `data`.
        partial: function (handler_meta, partial_value) {
          if (partial_value) {
            
            globals.Faux.Controller.partial_cache || (globals.Faux.Controller.partial_cache = {});
            var partial_cache = globals.Faux.Controller.partial_cache;
            
            /* TODO; Meld into options */
            if (partial_value && handler_meta.config.partial_suffix && !partial_value.match(/\.[^\/]+$/)) {
              partial_value = partial_value + handler_meta.config.partial_suffix;
            }
            else globals.console && globals.console.log('config:',handler_meta.config,' for '+partial_value);
            
            /* globals.console && globals.console.log('pre-fetching ' + partial_value); */
            /* TODO: options */
            if (handler_meta.config.prefetch_partials) {
              $.ajax({
                url: partial_value,
                cache: false,
                dataType: 'text',
                success: function (template, textStatus, XMLHttpRequest) {
                  partial_cache[partial_value] = Haml(template);
                }
              });
            }
            
            // load the partial before display
            handler_meta.before(function (data, __options__, callback) {
              if (partial_cache[partial_value]) {
                callback(data, __options__);
              }
              else {
                /* globals.console && globals.console.log(handler_meta.config.name + ' is fetching ' + partial_value + ' on the fly for data',data,'and __options__',__options__); */
                $.ajax({
                  url: partial_value,
                  cache: false,
                  dataType: 'text',
                  success: function (template, textStatus, XMLHttpRequest) {
                    partial_cache[partial_value] = Haml(template);
                    callback(data, __options__);
                  }
                });
              }
            });
            
            handler_meta.update_dom = function (data, __options__, callback) {
              
              var locals = _.extend({}, data, handler_meta.controller.__options__.helpers);
              
              var content = (__options__ && __options__.view) ? partial_cache[partial_value].call(__options__.view, locals) : partial_cache[partial_value](locals);
              /* globals.console && globals.console.log(handler_meta.config.name + ' is rendering ',data,' with fetched ' + partial_value); */
              if (handler_meta.config.renders) {
                /* globals.console && globals.console.log('rendering '+handler_meta.config.updates+' for ' + handler_meta.config.name); */
                __options__.renders || (__options__.renders = $(handler_meta.config.renders));
              }
              else if (handler_meta.config.updates) {
                /* globals.console && globals.console.log('updating '+handler_meta.config.updates+' for ' + handler_meta.config.name); */
                __options__.renders || (__options__.renders = $(handler_meta.config.updates));
              }
              else __options__.renders || (__options__.renders = handler_meta.controller.__el__());
              $(__options__.renders)
                .ergo(function (el) {
                  el
                    .empty()
                    .append(content)
                    ;
                  async.nextTick(function () {
                    handler_meta.controller.trigger('after_display', data, __options__);
                  });
                });
              callback(data, __options__);
            };
            
            handler_meta.display || (handler_meta.display = function (data, __options__, callback) {
              handler_meta.update_dom(data, __options__, callback);
            });
            
          }
          return handler_meta;
        },
        
        // A simple macro for setting the title of the browser window
        // when rendering the view. Only works for handlers that have a route!
        title: function (handler_meta, title_value) {
          if (handler_meta.config.route) {
            var title_fn;
            if ('function' === typeof(title_value)) {
              title_fn = title_value;
            }
            else if ('function' === title_value.toFunction) {
              title_fn = title_value.toFunction();
            }
            else if (_.isString(title_value)) {
              title_fn = function () {
                return title_value;
              };
            }
            var fn = function (data) {
              var new_title = title_fn(data);
              if (_.isString(new_title)) {
                document.title = new_title;
              }
            }; 
            handler_meta.after(fn);
          }
          return handler_meta;
        },
        
        // A simple macro for defining a redirection instead of a partial
        redirects_to: function (handler_meta, redirection_value) {
          if (redirection_value) {
            return handler_meta.after(
              function (data, __options__, callback) {
                var redirect;
                if (_.isString(redirection_value) && redirection_value.match(/^\//)) {
                  redirect = redirection_value;
                }
                else if (_.isString(redirection_value) && redirection_value.match(/^#\//)) {
                  redirect = redirection_value.substring(1);
                }
                else if (_.isFunction(redirection_value)) {
                  try {
                    redirect = redirection_value.call(handler_meta, data);
                  }
                  catch (err) {
                    globals.console && globals.console.log(err, " attempting to redirect via ", redirection_value);
                  }
                }
                if (redirect) {
                  var interpolations = _(redirect.match(/[*:][a-zA-Z_]\w*/g) || []).map(function (i) {
                    return i.substring(1);
                  });
                  var in_params = data || {};
                  var out_params = _(interpolations).foldl(function (acc, param) {
                    in_params[param] && (acc[param] = in_params[param]);
                    return acc;
                  }, {});
                  handler_meta.controller.setInterpolatedLocation(redirect,out_params);
                }
                callback(data, __options__);
              }
            );
          }
        },
        
        // Sets the current location hash to this handler's route, useful for 
        // cases where one handler delegates to another and you want the appearance
        // of a redirect, or when you want to call a handler as a function.
        //
        // Special rule: 'true' means use the handler's interpolated route.
        // The implication is that if you declare a handler using _display and
        // give it a route, you can redirect to that faux page simply by calling
        // the handler (with optional parameters, of course).
        location: function (handler_meta, location_value) {
          if (location_value) {
            return handler_meta.after(function (data) {
              var new_location;
              if (_.isString(location_value)) {
                new_location = _internal_interpolate(location_value, data);
              }
              else if (true === location_value && handler_meta.config.route) {
                new_location = _internal_interpolate(handler_meta.config.route, data);
              }
              if (new_location) {
                handler_meta.controller.saveLocation(new_location);
                /* globals.console && globals.console.log('saved location of '+new_location+' given '+handler_meta.config.route); */
              }
            });
          }
        },
        
        
        // alias for location
        save_location: function (handler_meta, location_value) {
          return this.location(handler_meta, location_value);
        },
        
        // **"Unobtrusive" Handlers**
        //
        // Many handlers are associated with a route. Some are associated with a DOM
        // selector: They are invoked if an element matching their selector is put into
        // the DOM by another display.
        //
        // The handlers are called *unobtrusive handlers*, and there are three key config
        // parameters that control them:
        //
        // First, a selector must be provided with `renders`, such as `renders:
        // '.customers.list'`. This selector is applied against the DOM, if any elements
        // match, the unobtrusive handler is triggered. Whatever it displays through
        // its partial will replace the contents of the selected element. `renders` is
        // not a macro.
        //
        // Second, the typical style is to configure them with
        // `route: false` to make sure that they cannot be invoked from setting the
        // location hash. `route` isn't a macro either.
        //
        // Third, there is a very limited facility for parameterizing an unobtrusive
        // handler by extracting parameters from the element's `id` and/or CSS classes,
        // using the `infers` macro. `infers` writes a handler step that examines the
        // `id` and `class` attributes of the handlers `__el__()` to infer parameters.
        //
        // Nota Bene: `MATCHER.lastIndex` needs to be explicitly set because IE will maintain the index unless NULL is returned,
        // which means that with two consecutive routes that contain params, the second set 
        // of params will not be found and end up in splat instead of params. Explanation
        // [here](https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/RegExp/lastIndex).
        infers: function (handler_meta, value) {
          if (value) {
            var MATCHER = /:([\w\d]+)/g;
            var REPLACER = "(.+)";
            var inferences = _.map(_.isArray(value) ? value : [value], function (inf) {
              return inf.replace('.','\\.')
            });
            // from key to a function that can extract it from an attribute ('.class' or '#id')
            var keys_to_inferers = _(inferences).reduce(function (acc, inference) {
              MATCHER.lastIndex = 0;
              var param_names = [];
              while ((inference_match = MATCHER.exec(inference)) !== null) {
                param_names.push(inference_match[1]);
              }
              var inference_regexp = new RegExp("^" + inference.replace(MATCHER, REPLACER) + "$");
              _(param_names).each(function (param, index) {
                acc[param] = function (attr) {
                  var attr_match;
                  if ((attr_match = inference_regexp.exec(attr)) !== null) {
                    return attr_match[index + 1];
                  }
                };
              });
              return acc;
            }, {});
            _(keys_to_inferers).each(function (fn, key) {
              var key_equals = key + '=';
              if (_.isUndefined(handler_meta.translations()[key_equals]) || _.isUndefined(handler_meta.translations()[key_equals][''])) {
                var extension = {};
                extension[key] = {
                  '': function (data, __options__) {
                    if (_.isUndefined(data[key])) {
                      var el = (__options__ && __options__.renders) || handler_meta.controller.__el__();
                      var attrs = _.map(el.attr('class').split(' '), function (str) { return '.' + str; });
                      if (!!el.attr('id')) {
                        attrs.push( '#' + el.attr('id') );
                      }
                      return _(attrs).chain()
                        .map(fn)
                        .compact()
                        .first()
                        .tap(function (_) {
                          globals.console && globals.console.log(_);
                        })
                        .value();
                    }
                  }
                };
                handler_meta.extend_translations(extension);
              }
              else globals.console && globals.console.log(key_equals+' conflicted default');
            });
          }
        },
        
        clazz: function (handler_meta, clazz_provided) {
          
          if (clazz_provided) {
          
            var clazz;
            
            if (_has_initialize_method(handler_meta.config.clazz)) {
              clazz = handler_meta.config.clazz;
            }
            else if (true === handler_meta.config.clazz) {
              clazz = Backbone.View.extend({});
            }
            else if (handler_meta.config.clazz) {
              clazz = Backbone.View.extend(handler_meta.config.clazz); // define extensions on the fly
            }
            else globals.console && globals.console.log('canna handle ',clazz_provided, handler_meta.config.clazz);
            
            var instance_methods = {
              
            };
            
            if (handler_meta.config.depends_on && !declares_an_intialize_method(clazz)) {
              var precedent_fn;
              if (true === handler_meta.config.depends_on) {
                precedent_fn = function () { return this.model };
              }
              else if (_.isString(handler_meta.config.depends_on)) {
                precedent_fn = function () { return this.options[handler_meta.config.depends_on]; }
              }
              else if (_.isFunction(handler_meta.config.depends_on)) {
                precedent_fn = handler_meta.config.depends_on;
              }
              instance_methods.initialize = function () {
                var precedent = precedent_fn.call(this, this);
                precedent && precedent.bind('change', this.render)
              }
            }
            
            if (declares_a_render_method(clazz)) {
              handler_meta.display = function (data, outer___options__) {
                var view_constructor_parameters = view_initialization(data, outer___options__);
                var view_instance = new clazz(view_constructor_parameters);
                view_instance.render();
              }
            }
            else {
              
              handler_meta.display = function (data, outer___options__, actual_callback) {
                // explanation: after_render and before_render are called whenever the view is re-rendered
                // after_display and before_display are only called when the view is first displayed
                
                var fns = (handler_meta.config.before_render || [])
                  .concat(
                    declares_a_before_render_method(clazz) ? [clazz.prototype.before_render] : []
                  )
                  .concat([call_old_render_fn])
                  .concat(
                    declares_an_after_render_method(clazz) ? [clazz.prototype.after_render] : []
                  )
                  .concat(
                    handler_meta.config.after_render || []
                  );
              
                function call_old_render_fn (optional_callback) {
                  var inner___options__ = _.extend({}, outer___options__, {
                    view: view_instance,
                    renders: view_instance.el
                  });
                  /* globals.console && globals.console.log('locals',locals,'__options__',inner___options__); */
                  handler_meta.update_dom(data, inner___options__, optional_callback || (function () {}));
                
                  return this;
                };
                  
                function thunk_to_fn (thunk) {
                  return _(fns).chain()
                    .map(callbackable_without_args)
                    .foldr(function (callback, fn) {
                      return function () {
                        fn.call(this, function () { callback.call(view_instance); });
                      };
                    }, thunk)
                      .value();
                };
                
                instance_methods.render = thunk_to_fn(function () {});
                
                var extended_view_clazz = clazz.extend(instance_methods);
               
                var view_constructor_parameters = view_initialization(data, outer___options__);
                
                var view_instance = new extended_view_clazz(view_constructor_parameters);
                
                thunk_to_fn(function () {
                  actual_callback(data, outer___options__);
                })();
                
              }
                
            }
          }
          
          function callbackable_without_args (fn) {
            return fn.length === 1 ? fn : function (callback) { fn.call(this); callback.call(this); };
          }
        
          function declares_a_render_method (view_clazz) {
            return (view_clazz.prototype.render !== Backbone.View.prototype.render);
          };
        
          function declares_an_intialize_method (view_clazz) {
            return (view_clazz.prototype.intialize !== Backbone.View.prototype.intialize);
          };
        
          function declares_a_before_render_method (view_clazz) {
            return !!view_clazz.prototype.before_render;
          };
        
          function declares_an_after_render_method (view_clazz) {
            return !!view_clazz.prototype.after_render;
          };
          
          // The parameters for the view constructor are limited to `model` if
          // you supply a model or model function, and `el`, which is inferred
          // from Faux.
          function view_initialization (data, __options__) {
            var options = _.extend({}, data);
          
            // compute the element
            if (_.isUndefined(options.el)) {
              if (__options__ && __options__.renders) {
                options.el = $(__options__.renders);
              }
              else options.el = handler_meta.controller.__el__();
            }
            
            if (_.isUndefined(options.model) && handler_meta.config.model_clazz) {
                
              var keys = _(handler_meta.config.model_clazz).keys();
              var model_name;
              
              if (1 == _(keys).size()) {
                model_name = keys[0];
              }
              else if (_(keys).include('model')) {
                model_name = handler_meta.config.name;
              }
              else if (_(keys).include(handler_meta.config.name)) {
                model_name = handler_meta.config.name;
              }
              options.model = data[model_name];
            }
            
            if (_.isUndefined(options.controller)) {
              options.controller = handler_meta.controller;
            }
        
            return options;
          };
        
        }
        
      }
      
      // This code writes one macro for each verb. Thus, when you write something like
      // `posts: '/fu/bar'`, Faux turns this into a function that does an AJAX `POST`
      // during the `before_display` step.
      _(['get', 'gets']).each(function (verb) {
        default_macros[verb] = function (handler_meta, value) {
          
          var model_clazz_definition = _.extend({}, handler_meta.config.model_clazz || {});
          var data_transform_fn;
          
          if (!_.isEmpty(model_clazz_definition))  {
            data_transform_fn = function (data) {
              _(model_clazz_definition).chain()
                .keys()
                  .each(function (key) {
                    if (!_.isUndefined(data[key]) && !(data[key] instanceof Backbone.Model) && !(data[key] instanceof Backbone.Collection)) {
                      var model_clazz = model_clazz_definition[key];
                      _.isUndefined(model_clazz) && globals.console && globals.console.log('pfft '+JSON.stringify(data)+' for ' + JSON.stringify(model_clazz_definition));
                      data[key] = new model_clazz(data[key]);
                    }
                  });
              return data;
            };
          }
          else data_transform_fn = function (data) { return data; };
        
          var fetch_data_fn = function (path, destination, data, callback_taking_the_value) {
            var server_route = _internal_interpolate(path, data);
            var host_partial_path = server_route.match(/^\//) ? server_route : '/' + server_route;
            var full_url = handler_meta.controller.__options__.host + host_partial_path;
            var param_names = _param_names_from_route(path);
            var query_params = _(data).chain()
              .keys()
              .select(function (key) {
                return _.isString(data[key]) || _.isNumber(data[key]);
              })
              .reject(function (key) {
                return _.include(param_names, key);
              })
              .reduce(function (hash, key) {
                hash[key] = data[key];
                return hash;
              }, {})
              .value();
            
            var request_object = {
              error: function(xhr, textStatus, errorThrown) {
                globals.console && globals.console.log('Error from '+full_url+":", xhr);
                var propagate = true;
                var code = xhr.status;
                var responseObj;
                try {
                  responseObj = (xhr.responseText ? JSON.parse(xhr.responseText) : {});
                }
                catch (error) {
                  responseObj = (xhr.responseText ? { responseText: xhr.responseText }: {});
                }
                var error_params = {
                  params: query_params,
                  code: code,
                  handler_meta: handler_meta,
                  data: data,
                  xhr: xhr,
                  response: responseObj,
                  textStatus: textStatus,
                  errorThrown: errorThrown,
                  stopPropagation: function () { propagate = false; },
                };
                if (handler_meta.error_handlers[code]) {
                  globals.console && globals.console.log('handling ' + code + ' in the handler');
                  handler_meta.error_handlers[code](error_params);
                }
                if (propagate && handler_meta.controller.__options__.handlers[code]) {
                  globals.console && globals.console.log('handling ' + code + ' in the controller');
                  handler_meta.controller.__options__.handlers[code](data);
                }
              },
              url: full_url,
              type: _present_tense(verb),
              cache: false,
              data: query_params,
              success: function (data_from_server, textStatus, xhr) {
                var params_from_sever = {};
                params_from_sever[destination] = data_from_server;
                _.extend(data, data_transform_fn(params_from_sever));
                callback_taking_the_value(data[destination]);
              }
            };
            $.ajax(request_object);
          };
            
          if (typeof(value) === 'string') {
            value = _({}).tap(function (key_to_path) {
              key_to_path[handler_meta.config.name] = value;
            });
          }
          
          _(value).each(function (path, key) {
            var key_equals = key + '=';
            if (_.isUndefined(handler_meta.translations()[key_equals]) || _.isUndefined(handler_meta.translations()[key_equals][''])) {
              var extension = {};
              var param_names = _param_names_from_route(path);
              if (_.isUndefined(model_clazz_definition[key])) {
                extension[key] = {
                  '': function (data, __options__, callback_taking_the_value) {
                    fetch_data_fn(path, key, data, callback_taking_the_value);
                  }
                };
              }
              else if (_.isEmpty(param_names)) {
                extension[key] = {
                  '': function (data, __options__, callback_taking_the_value) {
                    _(new model_clazz_definition[key]())
                      .tap(function (new_model) {
                        new_model.url = path;
                        new_model.fetch({
                          success: function () { callback_taking_the_value(new_model); }
                        })
                      });
                  }
                };
              }
              else {
                extension[key] = {
                  '': function (data, __options__, callback_taking_the_value) {
                    var options = _(param_names).reduce(function (acc, name) {
                      acc[name] = data[name];
                      return acc;
                    }, {});
                    _(new model_clazz_definition[key](options))
                      .tap(function (new_model) {
                        new_model.url = function () { return _internal_interpolate(path, this.attributes); };
                        new_model.fetch({
                          success: function () { callback_taking_the_value(new_model); }
                        })
                      });
                  }
                };
              }
              handler_meta.extend_translations(extension);
            }
            else globals.console && globals.console.log(key_equals+' conflicted default');
          });

        }
      });
      
      // This code writes one macro for each verb. Thus, when you write something like
      // `posts: '/fu/bar'`, Faux turns this into a function that does an AJAX `POST`
      // during the `before_display` step.
      _(['post', 'posts', 'put', 'puts', 'delete', 'deletes']).each(function (verb) {
        default_macros[verb] = function (handler_meta, value) {
          
          var model_clazz_definition = _.extend({}, handler_meta.config.model_clazz || {});
          var data_transform_fn;
          
          if (!_.isEmpty(model_clazz_definition))  {
            data_transform_fn = function (data) {
              _(model_clazz_definition).chain()
                .keys()
                  .each(function (key) {
                    if (!_.isUndefined(data[key]) && !(data[key] instanceof Backbone.Model) && !(data[key] instanceof Backbone.Collection)) {
                      var model_clazz = model_clazz_definition[key];
                      _.isUndefined(model_clazz) && globals.console && globals.console.log('pfft '+JSON.stringify(data)+' for ' + JSON.stringify(model_clazz_definition));
                      data[key] = new model_clazz(data[key]);
                    }
                  });
              return data;
            };
          }
          else data_transform_fn = function (data) { return data; };
        
          var fetch_data_fn = function (path, destination, data, __options__, callback) {
            var server_route = _internal_interpolate(path, data);
            var host_partial_path = server_route.match(/^\//) ? server_route : '/' + server_route;
            var full_url = handler_meta.controller.__options__.host + host_partial_path;
            var param_names = _param_names_from_route(path);
            var query_params = _(data).chain()
              .keys()
              .select(function (key) {
                return _.isString(data[key]) || _.isNumber(data[key]);
              })
              .reject(function (key) {
                return _.include(param_names, key);
              })
              .reduce(function (hash, key) {
                hash[key] = data[key];
                return hash;
              }, {})
              .value();
            
            var request_object = {
              error: function(xhr, textStatus, errorThrown) {
                globals.console && globals.console.log('Error from '+full_url+":", xhr);
                var propagate = true;
                var code = xhr.status;
                var responseObj;
                try {
                  responseObj = (xhr.responseText ? JSON.parse(xhr.responseText) : {});
                }
                catch (error) {
                  responseObj = (xhr.responseText ? { responseText: xhr.responseText }: {});
                }
                var error_params = {
                  params: query_params,
                  code: code,
                  handler_meta: handler_meta,
                  data: data,
                  xhr: xhr,
                  response: responseObj,
                  textStatus: textStatus,
                  errorThrown: errorThrown,
                  stopPropagation: function () { propagate = false; },
                };
                if (handler_meta.error_handlers[code]) {
                  globals.console && globals.console.log('handling ' + code + ' in the handler');
                  handler_meta.error_handlers[code](error_params);
                }
                if (propagate && handler_meta.controller.__options__.handlers[code]) {
                  globals.console && globals.console.log('handling ' + code + ' in the controller');
                  handler_meta.controller.__options__.handlers[code](data);
                }
              },
              url: full_url,
              type: _present_tense(verb),
              cache: false,
              data: query_params,
              success: function (data_from_server, textStatus, xhr) {
                var params_from_server = {};
                params_from_server[destination] = data_from_server;
                _.extend(data, data_transform_fn(params_from_server));
                callback(data, __options__);
              }
            };
            $.ajax(request_object);
          };
            
          if (typeof(value) === 'string') {
            value = _({}).tap(function (key_to_path) {
              key_to_path[handler_meta.config.name] = value;
            });
          }
          
          _(value).each(function (path, destination) {
            var fn = function (data, __options__, callback) {
              if (_.isUndefined(data[destination])) {
                globals.console && globals.console.log(destination + ' is undefined, fetching from '+path+' given',data);
                fetch_data_fn(path, destination, data, __options__, callback);
              }
              else callback(data, __options__);
            }
            
            handler_meta.before(fn);
            
          });

        }
      });
  
      // Defining a New Handler
      // ---
      
      // The generic function for defining a new handler from a configuration.
      var _define_handler = function (controller, config) {
        
        // **Construct the handler object**
        //
        // We are going to build a handler function and decorate it with a metric
        // fuckload of attributes. Those might come in handy for adavcend instrocpection
        // after the fact, and we have a pipe dream that handlers will be rewritten one day.
        // but, one thing at a time.
        //
        // The extra attributes are namespaced under `__options__`, just in case
        // we define something that clashes with some other property associated with functions.
        // The most interesting attribute is `fn`, which is the function that actually does the
        // handling of the function.
        var handler = _.extend(
          function (data, __options__, callback) {
            __options__ || (__options__ = {});
            __options__.handler = handler;
            handler.__options__.fn(data, __options__, callback || (function () {}));
            return this;
          },
          {
            __options__: {
              fn: function () {},
              controller: controller,
              config: config,
              error_handlers: {},
              compact_tx: {},
              update_dom: function (data, __options__, callback) {
                callback(data, __options__);
              },
              extract_translations_from_config: function () { 
                _.extend(this.compact_tx, _compact_tx(this.config));
                return this;
              },
              translations: function () { 
                return this.compact_tx;
              },
              extend_translations: function (extension) {
                _.extend(this.compact_tx, extension || {});
                return this;
              },
              before: function (fn) {
                if (_.isFunction(this.config.before_display)) {
                  this.config.before_display = [fn, this.config.before_display];
                }
                else if (_.isArray(this.config.before_display)) {
                  this.config.before_display.unshift(fn);
                }
                else if (_.isUndefined(this.config.before_display)) {
                  this.config.before_display = fn;
                }
                return this;
              },
              after: function (fn) {
                if (_.isFunction(this.config.after_display)) {
                  this.config.after_display = [this.config.after_display, fn];
                }
                else if (_.isArray(this.config.after_display)) {
                  this.config.after_display.push(fn);
                }
                else if (_.isUndefined(this.config.after_display)) {
                  this.config.after_display = fn;
                }
                return this;
              }
            }
          }
        );
        
        handler.__options__.define = function (callback_taking_no_arguments) {
        
          // **Extract ajax error handlers**
          for (var code in config) {
            if (config.hasOwnProperty(code) && !isNaN(code)) {
              handler.__options__.error_handlers[code] = config[code];
            }
          }
    
          _sort_out_model_and_view_clazzes(config, function () {
        
            // extract translations
            handler.__options__.extract_translations_from_config();
        
            // **"Macro" Expansion**
            //
            // As described above, each "macro" is a property and a function
            // that takes the handler and value of the property as parameters.
            //
            // It is expected to perturb the handler appropriately. This is where
            // most of the handler's action steps get written. Some of them are going to
            // be composed with steps written in config.
            var macros_to_expand = _.extend({}, controller.__options__.default_macros, controller.__options__.macros || {}, config.macros || {});
            _.each(_.keys(macros_to_expand), function (macro_key) {
              var value = handler.__options__.config[macro_key];
              if (!_.isUndefined(value)) {
                macros_to_expand[macro_key](handler.__options__, value);
              }
            });
        
            // **Aspect-Oriented Handlers**
            //
            // You can define a `before_` or `after_` function for display,
            // and Faux will mix it into the step. You could write the whole
            // thing yourself, but an advantage of this system is that you can let Faux
            // use convention to write the main step while you do additional customization
            // with a `before_` or `after_` step.
            _.each(['before_display', 'after_display'], function (expanded_step_name) {
              _([ config[expanded_step_name] ]).chain()
                .flatten()
                .each(function (advice) {
                  if (!_.isUndefined(advice)) {
                    handler.__options__[expanded_step_name] = _compose(handler.__options__[expanded_step_name] || _noop(), advice);
                  }
                });
            })
        
            if (_.isFunction(handler.__options__.display)) {
              if (_.isFunction(handler.__options__.before_display)) {
                handler.__options__.display = _compose(handler.__options__.before_display, handler.__options__.display);
              }
              if (_.isFunction(handler.__options__.after_display)) {
                handler.__options__.display = _compose(handler.__options__.display, handler.__options__.after_display);
              }
            }
            else if (_.isFunction(handler.__options__.before_display) && _.isFunction(handler.__options__.after_display)) {
              handler.__options__.display = _compose(handler.__options__.before_display, handler.__options__.after_display);
            }
            else if (_.isFunction(handler.__options__.before_display)) {
              handler.__options__.display = handler.__options__.before_display;
            }
            else if (_.isFunction(handler.__options__.after_display)) {
              handler.__options__.display = handler.__options__.after_display;
            }
        
            handler.__options__.make_satisfier =_make_make_satisfier(handler);
        
            handler.__options__.invocation_satisfier = handler.__options__.make_satisfier(_(handler.__options__.translations()).keys());
        
            // **Composing the handler function**
            //
            // We compose `handler.__options__.display` out of the individual
            // step functions. `handler` delegates to this function, so
            // in effect we are redefining `handler`.
            handler.__options__.fn = config.fn || function (data, __options__, callback) {
              callback || (callback = function () {});
              handler.__options__.invocation_satisfier(data || {}, __options__ || {}, function (data, __options__) {
                if (handler.__options__.display) {
                  handler.__options__.display(data, __options__, callback);
                } 
                else callback();
              });
            };
            
            callback_taking_no_arguments();
        
          });
        
        }

        return handler;
      
      };
      
      function _make_make_satisfier (handler) {
        return function (optional_requested) {
          return function (data, __options__, optional_callback) {
            __options__ || (__options__ = {});
            optional_callback || (optional_callback = function () {});
            var base_tx = handler.__options__.translations();
            /* globals.console && globals.console.log('base_tx for '+handler.__options__.config.name, base_tx); */
            var calculable = _(base_tx).keys(); 
            var no_arg_callback = optional_callback ? function () { optional_callback(data, __options__); } : function () {};
            
              var requested = optional_requested ? _.intersect(optional_requested, calculable) : calculable;
            // DEBUG
            
            (function (old_new_arg_callback) {
              no_arg_callback = function () {
                old_new_arg_callback();
              }
            })(no_arg_callback);
            
            var desired = function () {
              return _(requested).select(function (key) {
                return _.isUndefined(data[key]);
              });
            };

            var has_desired = function () {
              return !_.isEmpty(desired());
            }
            
            var attempted = true;
            
            // this is now stateful
            function satisfy_all () {
              if (has_desired()) {
                var unsatisfied = _(calculable).select(function (key) {
                  return _.isUndefined(data[key]);
                });
                var tx_in_play = _(unsatisfied).reduce(function (acc, key) {
                  acc[key] = _.clone(base_tx[key]);
                  return acc
                }, {});
                if (true === attempted || _(attempted).any(function(attempted_key) { return !_.isUndefined(data[attempted_key]); })) {
                  attempted = _.keys(tx_in_play);
                  satisfy_remaining(tx_in_play, no_arg_callback);
                }
                else {
                  // Log unsatisfied keys
                  no_arg_callback();
                }
              }
              else no_arg_callback();
            }
            
            function satisfy_remaining (tx, inner_callback) {
              if (has_desired()) {
                var try_me = _(tx).chain()
                  .keys()
                  .select(function (variable) {
                    return _(tx[variable]).any(function (fn, froms) {
                      return froms !== '';
                    });
                  })
                  .first()
                  .value();
                if (try_me) {
                  var calcs_to_try = tx[try_me];
                  var args;
                  var fn;
                  if (_(calcs_to_try).size() === 1) {
                    args = _(calcs_to_try).chain()
                      .keys()
                        .first()
                          .value();
                    fn = _simple_fn(calcs_to_try[args]);
                    delete tx[try_me];
                  }
                  else if (_(calcs_to_try).size() > 1) {
                    args = _(calcs_to_try).chain()
                      .keys()
                        .reject("_ === ''".lambda())
                          .first()
                            .value();
                    fn = _simple_fn(calcs_to_try[args]);
                    delete calcs_to_try[args];
                  }
                  else globals.console && globals.console.log('Bzzzt! '+try_me, tx);
                  var froms = _.flatten(_(args.split(',')).map(
                    function (str) { return _.compact(str.split(' '));  }
                  ));
                  if (froms.length == 0) {
                    globals.console && globals.console.log('wrong, this should be a default');
                  }
                  else if (froms.length > 0) {
                    var values = _(froms).map(function (from) { return data[from]; });
                    if (_.any(values, _.isUndefined)) {
                      satisfy_remaining(tx, inner_callback);
                    }
                    else {
                      if (fn.length == froms.length) {
                        // fn just expects datums (seed, location_id)
                        var value = fn.apply(handler, values);
                        data[try_me] = value;
                        if (_.isUndefined(value)) {
                          satisfy_remaining(tx, inner_callback);
                        }
                        else satisfy_all();
                      }
                      else if (fn.length == (froms.length + 1)) {
                        // fn just expects datums and a callback taking one argument, the result (seed, location_id, callback)
                        values.push(function (value) {
                          data[try_me] = value;
                          if (_.isUndefined(value)) {
                            satisfy_remaining(tx, inner_callback);
                          }
                          else satisfy_all();
                        });
                        fn.apply(handler, values);
                      }
                    }
                  }
                }
                else if (!_.isEmpty(tx)) {
                  var defaults = _(tx).reduce(function (acc, definitions, variable) {
                    var default_definition = definitions[''];
                    default_definition && (acc[variable] = default_definition);
                    return acc;
                  }, {});
                  satisfy_defaults(defaults, inner_callback);
                }
                else inner_callback();
              }
              else inner_callback();
            }
            
            
            // defaults:
            //
            // function () { return value || undefined; }
            // function (data) { return value || undefined; }
            // function (data, rowies) { return value || undefined; }
            // function (data, __options__, callback) { callback(value || undefined); }
            
            function satisfy_defaults (defaults, default_callback) {
              var try_us = _(defaults).keys();
              if (has_desired() && try_us.length) {
                var parallelizable_fns = _(try_us).chain()
                  .select(function (key) {
                    return _.isUndefined(data[key]);
                  })
                  .map(function (try_me) {
                    var fn = _simple_fn(defaults[try_me]);
                    if (fn.length < 3) {
                      return function (callback) {
                        data[try_me] = fn.call(handler, data, __options__);
                        callback(undefined, data[try_me]);
                      };
                    }
                    else if (fn.length == 3) {
                      // fn expects a callback function taking one argument, the result
                      return function (callback) {
                        fn.call(handler, data, __options__, function (value) {
                          data[try_me] = value;
                          callback(undefined, _({}).tap(function (result) { result[try_me] = data[try_me]; }));
                        });
                      };
                    }
                  })
                  .value();
                async.parallel(parallelizable_fns, function (err, results) {
                  if (err) {
                    globals.console && globals.console.log(err);
                  }
                  else satisfy_all();
                });
              }
              else default_callback();
            }    
            
            satisfy_all();
            
          };
          
        };
      }

      // The generic function for installing a new handler into its controller. 
      // It binds the object to the appropriate 
      // [Sammy events](http://code.quirkey.com/sammy/docs/events.html) so that the handler
      // is invoked when the appropriate route (if any) is invoked or the appropriate 
      // element is attached to the DOM.
      //
      // (It could be a method on `handler.__options__`, but the concept of re-installing
      // a handler will have to wait for an architecture involing uninstalling a handler
      // from any existing bindings. So for now, it's a helper function.)
      //
      // *TODO: Make it a handler function after all, not because it should be re-installable,
      //        but because then we can use macros to define new ways to install handlers.*
    var _install_handler = function (handler) {
        var config = handler.__options__.config;
        var controller = handler.__options__.controller;
        
        // Add the handler to the controller in the `.__options__` scope
        if (_.isString(config.name)) {
          if (_.isUndefined(controller.__options__.handlers[config.name])) {
            controller.__options__.handlers[config.name] = handler;
          }
          else globals.console && globals.console.log(config.name + ' is already a handler in the controller. Duplicate definition?');
        }
        else globals.console && globals.console.log('bad configuration, no name');
        
        return handler;
        
      };
    
      // Additonal methods added to every controller
      // ---
      
      // **Methods for defining and installing handlers**
      
      // binds all handlers to methods by name, routes, and so on.
      var _define_all = function (callback_taking_no_arguments) {
        
        // define the handlers from the config
        _(this.__options__.config).each(function (config, name) {
          _install_handler( _define_handler(this, config) );
        }, this);
        
        var installers = _(this.__options__.handlers).reduce(function (acc, handler) {
          
          var config = handler.__options__.config;
          var controller = this;
          
          acc[config.name] = function (callback) {
            
            // defining a method
            if (config.name.match(/^\w[\w\d_]*$/) && _.isUndefined(controller[config.name])) {
              controller[config.name] = handler;
            }
            else globals.console && globals.console.log(config.name + ' is already a method name in the controller. Duplicate definition?');
        
            // triggering a handler through a route
            if (config.route) {
              var param_names = _param_names_from_route(config.route);
              controller.route(config.route, config.name, function () {
                var params = _by_position_to_by_name(param_names, arguments);
                handler(params, { renders: controller.__el__() });
              });
              if (config.name.match(/^\w[\w\d_]*$/)) {
                // then the reoute_to
                var method_name = 'route_to_' + config.name;
                controller[method_name] = function (data) {
                  data || (data = {});
                  var wanted = $.merge([], param_names);
                  handler.__options__.make_satisfier(wanted)(data);
                  return '#' + _internal_interpolate(config.route, data);
                }
                controller.__options__ || (controller.__options__ = {});
                controller.__options__.helpers || (controller.__options__.helpers = {});
                controller.__options__.helpers[method_name] = controller[method_name]
              }
            }
        
            var updater_fn;
        
            //
            // triggering a handler unobtrusively
            //
            if (config.renders) {
              updater_fn = function (data, __options__) {
                $(__options__.renders)
                  .find(config.renders)
                    .each(function (index, dom_el) {
                      var new_data = _.extend(true, {}, data);
                      _(['id', 'model', 'models', 'it']).each(function (anaphor) {
                        delete new_data[anaphor];
                      });
                      render_queue.push({
                        handler: handler,
                        data: new_data,
                        __options__: { renders: $(dom_el) }
                      }, function () {});
                    })
                    ;
                
              };
            }
            else updater_fn = handler;
        
            if (_.isArray(config.events)) {
              _(config.events).each(function (event_name) {
                controller.bind(event_name, updater_fn);
              });
            }
        
            //
            // triggering a handler through an AJAX error status
            //
            if (config.code && !isNaN(config.code) && config.route) {
              controller.bind(config.code, function (event, error_data) {
                globals.console && globals.console.log(config.code + 'triggered! redirecting to ' + config.route);
                controller.setInterpolatedLocation(config.route, error_data.data);
              })
            }
          
            handler.__options__.define(callback);
          
          }
          
          return acc;
        
        }, {}, this);
        
        async.parallel(installers, callback_taking_no_arguments);
        
      };
      
      var _add_config = function (controller, name, optional_config, defaults) {
        defaults || (defaults = {});
        controller.__options__.config[name] = controller.__options__.with_controller_defaults(
          _mix_in_optional_parameters_and_conventions(controller, name, optional_config, defaults)
        );
        return controller;
      }
      
      // The core method for defining a new handler that renders something in the DOM.
      var _method = function (name, optional_config) {
        return _add_config(this, name, optional_config, { 
          method: 'get',
          location: true,
          redirect: false 
        });
      };
    
      // The core method for defining a new handler that performs an action and then
      // redirects to a display, a client-side implementation of the
      // [Post-Redirect-Get](https://secure.wikimedia.org/wikipedia/en/wiki/Post/Redirect/Get)
      // ("PRG") pattern.
      var _action = function (name, optional_config) {
        return _add_config(this, name, optional_config, { 
          method: 'post', 
          updates: false,
          view: false,
          partial: false
        });
      };
    
      // Binding an arbitrary function to an error instead of a handler.
      var _error = function(code, handler_fn) {
        var name = '' + code;
        return _add_config(this, name, { 
          name: name,
          route: false, 
          updates: false,
          view: false,
          partial: false,
          fn: _callbackable(handler_fn)
        });
        return this;
      };
           
      // **Methods for establishing scopes**
      //
      // In Faux, scopes establish tenmporary defaults. A simple
      // case might be something like this:
      //
      //     controller
      //       .begin({ 
      //         gets_home_path: '/bikes',
      //         partial: 'bikes'
      //       })
      //         .method({
      //           gets: '',
      //           partial: 'plural'
      //         })
      //         .method({
      //           gets: ':part_number',
      //           partial: 'singular'
      //         })
      //         .end()
      //       ;
      //
      // `begin` establishes a scope and `end` ends it. Within the scope,
      // `gets` has a home path, so our two faux-pages get their data from the
      // server using `GET /bikes` and `GET /bikes/42`. Likewise, there is a home
      // path for partials, so the partials used to display our faux pages will
      // be `/bikes/plural.haml` and `/bikes/singular.haml`.
      
      var _begin = function(config) {
        this.__options__.config_stack.push(config);
        return this;
      };
      
      var _end = function() {
        if (this.__options__.config_stack.length > 0) {
          this.__options__.config_stack.pop();
          return this;
        }
        else {
          globals.console && globals.console.log('error, ".end()" without matching ".begin({...})"');
        }
      };
      
      var _scope = function(config, fn) {
        return this
          .begin(config)
          .K(fn)
          .end()
          ;
      };
      
      // The method for forcibly setting the window location
      var _setInterpolatedLocation = function(path, optional_data) {
        if (optional_data) {
          path = _fully_interpolated(path, optional_data);
        }
        if (path.match(/^\//)) {
          window.location.hash = path;
        }
        else window.location = path;
      };
      
      var _initialize = function (options) {
        var this_controller = this;
        options || (options = {});
        this.__options__ = {
          element_selector: 'body',
          default_macros: default_macros,
          error_handlers: {},
          host: '',
          handlers: {},
          config: {},
          config_stack: [{
            paths: ['route', 'partial', 'get'],
            stacks: ['javascript'],
            dynamic: {
              common: true,
              method: true,
              clazz: true
            }
          }],
          macros: {},
          /* TODO: Kill this */
          with_controller_defaults: function (config) {
            var out = _(config).reduce(function (acc, value, key) {
              if ('namespace' === key) {
                acc[key] = value;
              }
              else if (_([_.isFunction, _.isString, _.isNumber, _.isBoolean, _.isDate, _.isRegExp, _.isNaN, _.isNull, _.isUndefined]).any(function (fn) { return fn(value); })) {
                acc[key] = value;
              }
              else acc[key] = _.clone(value);
              return acc;
            }, {});
      
            // and a default DOM selector to update
            if (undefined === out.updates) {
              out.updates = out.renders || this.root_element_selector;
            }
            return out;
          }
        };
        
        _(options).each(function (value, key) {
          if (_.isUndefined(this_controller.__options__[key])) {
            this_controller.__options__.config_stack[0][key] = value;
          }
          else this_controller.__options__[key] = value;
        });
        this.__options__.root_element_selector = this.__options__.updates || this.__options__.element_selector || 'body';
        _.extend(this, Backbone.Events);
        return this;
      };
      
      // A class for the controller
      var clazz = Backbone.Controller.extend({
        __el__: function () {
          return $(this.__options__.element_selector);
        },
        method: _method,
        display: _method, /* deprecated */
        action: _action,  /* deprecated */
        begin: _begin,
        end: _end,
        scope: _scope,
        error: _error,
        define_all: _define_all,
        setInterpolatedLocation: _setInterpolatedLocation,
        initialize: _initialize,
        K: function (fn) {
          fn(this);
          return this;
        },
        T: function (fn) {
          return fn(this);
        }
      });
        
    // Place the external interpolation helper function into
    // the `Faux` scope.
    jQuery.extend(Faux, {
      fully_interpolated: _fully_interpolated,
      simple_fn: _simple_fn
    });
  
    return clazz;

  })();
  
  // Readability Helpers
  // ---
  //
  // These helper give you options for making your declarations more readable.
  
  // Really simple inflection conversion, allows you to write either `get: '/foo/bar'` or
  // `gets: '/foo/bar'` when defining handlers.
  function _present_tense (verb) {
    return verb.match(/^get/) ? 'get' : (
      verb.match(/^post/) ? 'post' : (
      verb.match(/^put/) ? 'put' : (
      verb.match(/^del/) ? 'delete' : (verb)
    )));
  };
  
  // **Continuation Passing Style**
  //
  // We've fallen into Javascript's ghastly habit of 
  // [reinventing CPS](http://matt.might.net/articles/by-example-continuation-passing-style/).
  //
  // Faux chains functions together using CPS. There are lots of places where
  // functions are chained together. The most obvious is the "handler steps" described above: Each
  // step is chained using CPS. This allows Faux to do sensible things when doing something asynchronously.
  // 
  // You may not expect something to be asynchronous, but any call to a server
  // is AJAX, and therefore asynchronous by default. That includes any rendering of a partial, since the
  // partial may need to be fetched from the server using AJAX.
  
  // the test for noop
  function _is_noop (fn) {
    return (_.isFunction(fn) && fn.__options__ && fn.__options__.is_noop);
  }
  
  function _callbackable (handler) {
    if (_.isUndefined(handler) || _is_noop(handler)) {
      return _noop();
    }
    /* temporary fix to use ONLY the { foo: function (data) { ... } } syntax */
    if (!_.isFunction(handler)) {
      var handler = _mapper_to_fn(handler);
    }
    if (handler.length > 2) {
      /* the handler takes data, __options__, and a callback. we trust it to do the right thing. */
      return handler;
    }
    else if (handler.length <= 2) {
      /* the handler takes data and __options__, but no callback. */
      return function (data, __options__, callback) {
        var return_value = handler(data, __options__);
        if (_.isUndefined(return_value)) {
          return callback(data, __options__);
        }
        else if (return_value) {
          return callback(return_value, __options__);
        }
        // else retun value is false, so abort the chain
      }
    }
    else globals.console && globals.console.log('WTF!?', handler);
  };
  
  // Composes two functions through CPS, converting them into _callbackables
  // in the process
  function _compose (x, y) {
    if (_. isUndefined(y) || y.is_noop) {
      return _callbackable(x);
    }
    else if (_. isUndefined(x) || x.is_noop) {
      return _callbackable(y);
    }
    else return function (data, __options__, callback) {
      _callbackable(x)(data, __options__, function (data2) {
        _callbackable(y)(data2, __options__, callback);
      })
    };
  };
  
  function _name_in_assignment (key) {
    var match = key &&  /^([a-zA-Z_]([a-zA-Z0-9_]*))\s*=$/.exec(key);
    if (match) return match[1];
  }
  
  function _extend (full_stack) {
    var out = _.foldl(full_stack, function (acc,hash) { return jQuery.extend(acc,hash); }, {});
    var assignment_matcher = /^([a-zA-Z_]([a-zA-Z0-9_]*))\s*=$/;
    for (var prop in out) {
      if (out.hasOwnProperty(prop)) {
        var prop_stack = _(full_stack).chain()
          .pluck(prop)
          .reject(_.isUndefined)
          .value();
        if (true === out[prop]) {
          /* that's the value */
        }
        else if (_(prop_stack).any(function (prop) { return false === prop; })) {
          out[prop] = false;
        }
        else if (_(out.stacks).include(prop)) {
          out[prop] = _(prop_stack).chain()
            .select(_.isString)
            .reject(_.isEmpty)
            .value();
        }
        else if (prop.match(/^before_/)) {
          out[prop] = prop_stack;
        }
        else if (prop.match(/^after_/)) {
          out[prop] = prop_stack.reverse();
        }
        else if (_name_in_assignment(prop)) {
          var property_name = _name_in_assignment(prop);
          out[property_name + '='] = _(prop_stack).flatten();
        }
        else if (_(out.paths).include(prop) && _(prop_stack).any(_.isString)){
          /* this could be a join, but we're leaving room for customization */
          out[prop] = _(prop_stack).chain()
            .select(_.isString)
            .reject(_.isEmpty)
            .value()
            .join('/');
        }
      }
    }
    return out;
  }
        
  // The `.method(...)` and `.action(...)` methods both ultimately work with a hash called `config`
  // that configures a new handler for Sammy. This function provides you with a lot of flexibility when
  // declaring the hash. That in turn makes for mroe readable declarations. For example, you could
  // write:
  //
  //     .method({ name: 'fu', partial: 'bar' });
  //
  // However, the name doesn't really stand out. That matters, because by convention the name serves as a
  // default. So while this is legal, you can also write:
  //
  //     .method('fu', { partial: 'bar' });
  //
  // Placing the name first as its own parameter ames it more obvious. In really simple cases, you can even write:
  //
  //     .method('foo');
  //
  // There are usually default configuration options. These could be mixed in by writing:
  //
  //      .action('bar', _.extend(, some_defaults, { /* my config */ });
  //
  // But again this de-emphasizes the configuration you are writing. So instead, you can write:
  //
  //     .action('bar', { /* my config */ }, some_defaults);
  //
  // Or:
  //
  //     .action({ /* my config */ }, some_defaults);
  //
  // Read on for more of its special cases and logic.
  function _mix_in_optional_parameters_and_conventions (controller, name, optional_config, local_defaults) {  
    /*TODO: Extract to a hash of default behaviours so that we can write our own*/
    
    if (_.isString(name)) {
      name_hash = { name: name };
    }
    else if ('number' === typeof(name)) {
      name_hash = { code: name, name: name.toString() };
    }
    
    optional_config || (optional_config = {});
    local_defaults  || (local_defaults  = {});
    
    var config = _.extend({}, local_defaults, optional_config, name_hash);
    
    // First, missing configurations
      
    // The definition of a new handler is driven by the configuration
    // parameters you supply. But we value convention over configuration, so
    // what follows are a metric fuckload of special cases.
    
    // Many conventions rely on each handler having a unique name within the
    // application. Faux doesn't enforce that names be unique, but it does
    // take a shot at guessing the name if you don't supply one.
    //
    // `.gets`, `.posts` and so on are all declarations that the  method can
    // go to a server for some `data`. The first rule is that if you don't supply
    // a name and you do supply a server path, the name of the handler will be the
    // server path.
    //
    // Nota bene: remember that `_mix_in_optional_parameters_and_conventions` lets you write either
    // `.action('doSomething', { ... })` or `.action({ name: 'doSomething', ... })` as
    // you prefer.
    if (_.isUndefined(config.name)) {
      var verb = _.detect(_verb_inflections(), function (v) { return _.isString(config[v]); });
      if (verb) {
        config.name = config[verb];
      }
    }
    
    // `config.route` is the route used by backbone.Controller to trigger the application. If you don't 
    // supply a route, Faux guess it as the name. Some additional massaging below takes
    // care of the hash and root path, so if you write `.method('bravado')`, you are getting
    // a route of `#/bravado` by convention.
    //
    // Also note that we very deliberately test for whether you have defined a route, not
    // for truthiness. Under certain circumstances you may wish to have a handler that
    // cannot be triggered with a location. When that is the case, you can write
    // `.method('stealth', { route: false, ... })` and no route will be configured
    // by convention.
    if (_.isUndefined(config.route) && config.name) {
      config.route = config.name;
    }
    
    // `config.partial` is the partial path to a partial used by Sammy to display `data`. 
    // If you don't supply it, Faux guess it as the name. Some additional massaging below takes
    // care of a root path and default suffix using scopes and application defaults, path, so 
    // if you write `.method('bravado')`, you could be getting a partial of 
    // `/partials/bravado.haml` by convention.
    if (_.isUndefined(config.partial)) {
      config.partial = config.name;
    }
    
    // second, extend historically
    
    var full_stack = _.clone(controller.__options__.config_stack)
    full_stack.push(config);
    config = _extend(full_stack);
    
    _defaultize_config_dot_renders(config);
    
    _extract_inferences_from_renders(config);
    
    // `config.events` is an array of events that fire the handler.
    if (_.isUndefined(config.events)) {
      config.events = [];
      // By default, the name of a handler is its default event
      if (config.name) {
        config.events.push(config.name);
      }
      // By default, specifying `config.renders` makes an unobtrusive handler
      if (config.renders) {
        config.events.push('after_display');
        config.events.push('run');
      }
    }
    
    // third, modification
    
    // next we deal with certain conventions. One is that if there is a config
    // parameter called `foo`, then the parameter `foo_home_path` has special
    // significance: the value for `foo` is actually `config.foo_home_path + '/' + config.foo`.
    //
    // We call this a prefix, and it is very useful in conjucntion with scopes.
    //
    // This is generalized: There is a set of parameter suffixes and separators defined as
    // a hash:
    var prefixes = {
      '_home_path': '/',
      '_prefix': '_'
    };
    for (var prop in config) {
      /*TODO: Mix in `foo_suffix`*/
      
      var val = config[prop];
      if (config.hasOwnProperty(prop) && val) {
        _(prefixes).each(function (separator, suffix) {
          if (config[prop+suffix]) {
            if (_.isString(val)) {
              config[prop] = [config[prop+suffix], val].join(separator);
            }
            else if ('object' === typeof(val)) {
              for (var inner_prop in val) {
                if (val.hasOwnProperty(inner_prop) && _.isString(val[inner_prop])) {
                  val[inner_prop] = [config[prop+suffix], val[inner_prop]].join(separator);
                }
              }
            }
          }
        });

      }
    }
    
    // Finally, a special case that routes should start with `/`
    if (_.isString(config.route) && !config.route.match(/^\//)) {
      config.route = '/' + config.route;
    }
    
    return config;
  };
  
  function _sort_out_model_and_view_clazzes (config, callback_taking_no_arguments) {
    
    if (_.isUndefined(config.clazz)) {
      _view_clazz(config.name, config, function (clazz) {
        config.clazz = clazz;
        get_model_clazz();
      });
    }
    else if (true === config.clazz) {
      _view_clazz(config.name, config, function (clazz) {
        config.clazz = clazz || Backbone.View.extend({});
        get_model_clazz();
      });
    }
    else get_model_clazz();
    
    function get_model_clazz () {
    
      // if no `model_clazz` is provided, try to infer it
      if (_is_a_model_class(config.model_clazz)) {
        config.model_clazz = { model: config.model_clazz };
        do_something_with_the_model_clazz();
      }
      else if (_.isString(config.model_clazz)) {
        var model_name = config.model_clazz;
        _model_clazz(model_name, config, function (model_clazz) {
          if (model_clazz) {
            config.model_clazz = {};
            config.model_clazz[model_name] = model_clazz;
          }
          else config.model_clazz = false;
          do_something_with_the_model_clazz();
        });
      }
      else if (_.isUndefined(config.model_clazz) || true === config.model_clazz) {
        var model_name = config.name;
        _model_clazz(model_name, config, function (model_clazz) {
          if (model_clazz) {
            config.model_clazz = {};
            config.model_clazz.model = model_clazz;
            config.model_clazz[model_name] = model_clazz;
          }
          else config.model_clazz = false;
          do_something_with_the_model_clazz();
        });
      }
      else do_something_with_the_model_clazz();
    
    }
    
    function do_something_with_the_model_clazz () {
    
      // translation by convention
      // TODO: supply *false* to turn one of these off
      if (config.model_clazz) {
        var clazzes_to_names = _(config.model_clazz).reduce(function (acc, clazz, name) {
          var pair = _(acc).detect(function (p) { return p[0] === clazz; });
          if (_.isUndefined(pair)) {
            pair = [clazz, []];
            acc.push(pair);
          }
          pair[1].push(name);
          return acc;
        }, []);
      
        var model_names = _(clazzes_to_names).chain()
          .select(function (pair) { return _is_a_model_class(pair[0]); })
          .reduce(function (acc, pair) {
            return acc.concat(pair[1]);
          }, [])
          .value();
        
        var old = _(config).clone();
        
        var already_know = _compact_tx(config);
      
        _(model_names).each(function (model_name) {
          // ids given a model
          var id_names = [model_name + '_id'];
          if ('model' === model_name || 1 == _(model_names).size()) {
            id_names.push('id');
          }
          _(id_names).each(function (id_name) {
            config[id_name+'='] || (config[id_name+'='] = []);
            (already_know[id_name] && already_know[id_name][model_name]) || (
              config[id_name+'='].push(
                _key_value_hash(model_name, function (model) { return model.id; })
              )
            );
          });
          // collection?
          var collection_clazz_names = [model_name + '_collection'];
          if (_is_singular(model_name)) {
            collection_clazz_names.push(_plural(model_name));
          }
          _(collection_clazz_names).each(function (collection_clazz_name) {
            config[collection_clazz_name + '='] || (config[collection_clazz_name + '='] = []);
            (already_know[collection_clazz_name] && already_know[collection_clazz_name][model_name]) || (
              config[collection_clazz_name + '='].push(
                _key_value_hash(model_name, function (model) { return model.collection; })
              )
            );
            _(id_names).each(function (id_name) {
              var params = collection_clazz_name + ' ' + id_name;
              config[model_name + '='] || (config[model_name + '='] = []);
              (already_know[model_name] && already_know[model_name][params]) || (
                config[model_name + '='].push(
                  _key_value_hash(params, function (collection, id) { return collection.get(id); })
                )
              )
            });
          })
        });
      
      }
    
      callback_taking_no_arguments();
      
    }
    
  }
    
  function _fully_interpolated () {
    var hash_path = _fully_interpolated.arguments[0];
    var data = {};
    for (var i = 1; i < _fully_interpolated.arguments.length; ++i) {
      _.extend(true, data, arguments[i]);
    }
    $.each(hash_path.match(/[*:][a-zA-Z_]\w*/g) || [], function(i, parameter) {
      var parameter_name = parameter.substring(1);
      var parameter_value = data[parameter_name];
      delete data[parameter_name];
      hash_path = hash_path.replace(parameter, parameter_value);
    });
    var params = [];
    $.each(data, function (parameter_name, parameter_value) { 
      if ('etc' != parameter_name && data.hasOwnProperty(parameter_name) && (parameter_value || 0 === parameter_value)) {
        params.push(encodeURIComponent(parameter_name) + '=' + encodeURIComponent(parameter_value));
      }
    })
    return _.compact([
      hash_path,
      _.compact(params).join('&')
    ]).join('?')
  };
  
  function _internal_interpolate (fn_or_path, data, optional_data) {
    var fn;
    if (_.isString(fn_or_path) && fn_or_path.match(/^(#|\/)/)) {
      fn = function () { return fn_or_path; };
    }
    else if (_.isFunction(fn_or_path)) {
      fn = fn_or_path;
    }
    else if (_.isFunction(fn_or_path.toFunction)) {
      fn = fn_or_path.toFunction();
    }
    var path = fn.call(this, data, optional_data);
    var transformed_path = path;
    /* TODO: replace with a fold */
    $.each(path.match(/\:[a-zA-Z_]\w*/g) || [], function(i, parameter) {
      var parameter_name = parameter.substring(1);
      var parameter_value = data[parameter_name] || (data.server_data && data.server_data[parameter_name]);
      transformed_path = transformed_path.replace(parameter, parameter_value);
    });
    $.each(path.match(/\*[a-zA-Z_]\w*$/g) || [], function(i, splat_parameter) {
      var parameter_name = splat_parameter.substring(1);
      var parameter_value = data[parameter_name] || (data.server_data && data.server_data[parameter_name]);
      transformed_path = transformed_path.replace(splat_parameter, parameter_value);
    });
    return transformed_path;
  };
  
  // This function works very much like `_.extend(true, ...)`. It was written for the worst
  // of all possible reasons, because I didn't know you could pass `true` to `_.extend(...)`
  // to perform a recursive extension.
  function _meld () {
    var args = _.compact(arguments);
    if (args.length == 0) {
      return;
    }
    else if (args.length == 1) {
      return args[0];
    }
    else if (_.every(args, _.isArray)) {
      return _.foldl(args, function (x,y) { return x.concat(y); }, []);
    }
    else if (_.some(args, function (obj) { return typeof(obj) !== 'object'; })) {
      return args[args.length - 1];
    }
    else return _.foldl(args,
      function (extended, obj) {
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            extended[i] = _meld(extended[i], obj[i]);
          }
        }
        return extended;
      }, 
      {}
    );
  };
  
  // A mapper is a function that maps a data object into another data object.
  // Mappers can also perform actions for side-effects. If a mapper doesn't
  // return a new data object, the original is returned.
  //
  // Mappers come up in several places, most notably when a programmer explicitly
  // writes step advice, e.g. `before_display: function (data) { ... }`.
  //
  // Obviously, a mapper can be a single function taking one argument. Mappers
  // can also be an entity with a `.toFunction` method or a hash describing the
  // resulting object. In the case of a hash, each element must either be
  // a value or a function. If it's a function, it is called with the data object as
  // a parameter to determine the value at that key.
  //
  // One benefit fo mappaers is that they always run, whereas calculations are only
  // used to solve for missing values. Soa  mapper can overwrite a value. A calculation
  // can never overwrite a value. The disadvantage is that mappers can never be used
  // to infer values for `route_to` helpers.
  function _mapper_to_fn (mapper) {
    var fn = _simple_fn(mapper);
    if (fn) {
      return fn;
    }
    else if (true === mapper || false === mapper || _.isUndefined(mapper)) {
      return I;
    }
    else {
      return function (data) {
        var result = {};
        
        _(mapper).each(function (value, name) {
          if (_.isFunction(value) && 1 === value.length) {
            result[name] = value.call(this, data);
          }
          else if (value && _.isFunction(value.toFunction)) {
            var fn = value.toFunction();
            if (1 === fn.length) {
              result[name] = fn(data);
            }
            else (globals.console && globals.console.log('error, ' + value + ' is incorrectly configured'));
          }
          else if (value) {
            result[name] = value;
          }
        });
        
        return result;
      };
    }
    
  };
  
  // The identity function
  function I (data) { return data; };
  
  // The inflections you can use for the various verbs. It's written as a function so that it can be placed at the bottom of the file.
  function _verb_inflections () { return ['get', 'gets', 'post', 'posts', 'put', 'puts', 'delete', 'deletes']; };
  
  // a handy noop function, the equivalent of I in CPS
  function _noop () {
    var noop;
    noop || (noop = function (data, __options__, callback) { return callback(data, __options__); });
    noop.__options__ || (noop.__options__ = {is_noop: true});
    return noop;
  };

  function _class_case( s ) {
    return jQuery.trim(s)
      .replace( /([\s_\\\/]+)([a-z])/g, function(t,a,b) { return b.toUpperCase(); } )
      .replace( /^(\w)(\w+)$/, function (t,a,b) { return a.toUpperCase() + b; } );
  }
  
  function _underscored( s ) {
    return jQuery.trim(s)
      .replace( /^(.)(.*)$/, function(t,a,b) { return a.toLowerCase() + b; } )
      .replace( /([A-Z])/g, function (t,a) { return '_' + a.toLowerCase(); } );
  }

  function _is_plural (s) {
    return s.match(/ies$/) || s.match(/xen$/) || s.match(/s$/);
  }
  
  // TODO: a real inflected plural
  function _plural (s) {
    return _singular(s) + 's';
  }
  
  function _is_singular(s) {
    return !_is_plural(s);
  }

  function _singular (s) {
    if (s.match(/ies$/)) {
      return s.slice(0,s.length-3);
    }
    else if (s.match(/xen$/)) {
      return s.slice(0,s.length-2);
    }
    else if (s.match(/s$/)) {
      return s.slice(0,s.length-1);
    }
    else return s;
  }
  
  function _param_names_from_route (route) {
    var param_names = []; 
    var SINGLE_PARAM_MATCHER = /:([\w\d]+)/g;
    while ((match = SINGLE_PARAM_MATCHER.exec(route)) !== null) { 
      param_names.push(match[1]); 
      route = route.replace(':' + match[1],'xxxxx'); 
    }; 
    var SPLAT_MATCHER = /\*([\w\d\/]+)$/g;
    if ((match = SPLAT_MATCHER.exec(route)) !== null) { 
      param_names.push(match[1]); 
      route = route.replace(':' + match[1],'xxxxx'); 
    };
    return param_names;
  }
        
  function _by_position_to_by_name (param_names, param_array) {
    return _(param_names).chain()
      .zip(param_array)
      .reject(function (pair) { return _.isUndefined(pair[0]) || _.isUndefined(pair[1]); })
      .reduce(function (hash, pair) {
        hash[pair[0]] = pair[1];
        return hash;
      }, {})
      .value();
  }
          
  function _has_initialize_method (clazz) {
    return clazz && clazz.prototype && clazz.prototype.initialize;
  }
  
  function _instanceof_backbone (instance) {
    return (instance instanceof Backbone.Model) || (instance instanceof Backbone.Collection) || (instance instanceof Backbone.View);
  }
  
  function _simple_fn (fn) {
    if ('function' === typeof(fn)) {
      return fn;
    }
    else if ('function' === typeof(fn.toFunction)) {
      return fn.toFunction();
    }
    else if ('function' === typeof(fn.lambda)) {
      return fn.lambda();
    }
    else return false;
  }
  
  function _key_value_hash(key, value) {
    return _.tap({}, function (h) { h[key] = value; });
  }
  
  function _compact_tx (config) {
    
    var array_of_tx = _(config).reduce(function (acc, value, key) {
      var property_name = _name_in_assignment(key);
      if (property_name) {
        var definition_stack = _([value]).chain()
          .flatten()
          .map(function (definition_hash) {
            var h = {};
            h[property_name] = definition_hash;
            return h;
          })
          .value();
        acc = acc.concat(definition_stack);
      }
      return acc;
    }, []);
        
    return _([array_of_tx]).chain()
      .flatten()
      .reduce(function (acc, tx) {
        _(tx).each(function (definitions, to) {
          if (definitions instanceof Backbone.View) {
            acc[to] = _.extend(acc[to] || {}, { '': function () { 
                return definitions; 
              } 
            });
          }
          else if (definitions instanceof Backbone.Model) {
            acc[to] = _.extend(acc[to] || {}, { '': function (data, __options__, callback_taking_the_value) { 
                if (_.isEmpty(definitions.attributes)) {
                  return definitions.fetch({success: callback_taking_the_value}); 
                } 
                else return callback_taking_the_value(definitions);
              }
            });
          }
          else if (definitions instanceof Backbone.Collection) {
            acc[to] = _.extend(acc[to] || {}, { '': function (data, __options__, callback_taking_the_value) { 
                if (_.isEmpty(definitions.models)) {
                  return definitions.fetch({success: callback_taking_the_value}); 
                } 
                else return callback_taking_the_value(definitions);
              }
            });
          }
          else {
            var fn = _simple_fn(definitions);
            if (fn) {
              acc[to] = _.extend(acc[to] || {}, { '': fn });
            }
            else acc[to] = _.extend(acc[to] || {}, definitions);
          }
        });
        return acc;
      }, {})
      .value();
  }
  
  function _is_a_model_class (clazz) {
    return !!(clazz && clazz.prototype && clazz.prototype.fetch);
  }
  
  function _is_a_collection_class (clazz) {
    return !!(clazz && clazz.prototype && clazz.prototype.models);
  }
  
  function _model_clazz (name, config, callback_taking_the_clazz) {
    var base_name = name && _class_case(name);
    if (base_name) {
      var candidates = [base_name, base_name + 'Model'];
      _is_plural(base_name) && candidates.push(_singular(base_name) + 'Collection');
      _first_clazz(candidates, config, callback_taking_the_clazz);
    }
    else callback_taking_the_clazz();
  }
  
  function _view_clazz (name, config, callback_taking_the_clazz) {
    var base_name = name && _class_case(name);
    if (base_name) {
      var candidates = [base_name + 'View'];
      if (_is_plural(base_name)) {
        candidates.push(_singular(base_name) + 'CollectionView');
      }
      else candidates.push(base_name + 'ModelView');
      _first_clazz(candidates, config, callback_taking_the_clazz);
    }
    else callback_taking_the_clazz();
  }
  
  var paths_done = {};
  
  function _loads_common_js (config) {
    return (true === config.dynamic || (config.dynamic && config.dynamic.common));
  }
  
  function _loads_method_js (config) {
    return (true === config.dynamic || (config.dynamic && config.dynamic.method));
  }
  
  function _loads_clazz_js (config) {
    return (true === config.dynamic || (config.dynamic && config.dynamic.clazz));
  }
  
  function _first_clazz(candidates, config, callback_taking_the_clazz) {
    
    // check for common.js before looking for the specific class
    
    var javascript = config.javascript.join('/');
    if (_loads_common_js(config) && _.isString(config.common)) {
      var paths = _.range(1, config.javascript.length + 1).map(function (_) { return config.javascript.slice(0,_).join('/') + '/' + config.common; });
      _(paths).chain()
        .reject(function (path_to_common) { return paths_done[path_to_common]; })
        .each(function (path_to_common) { 
          jQuery.getScript(path_to_common); 
          paths_done[path_to_common] = path_to_common; 
        });
    }
    
    // then look for already loaded
    var namespace = config.namespace;
    
    var clazz = _(candidates).chain()
      .map (function (pseudo_class_name) {
        return  (namespace && namespace[pseudo_class_name]) || window[pseudo_class_name];
      })
      .compact()
      .first()
      .value();
    if (clazz) {
      callback_taking_the_clazz(clazz);
    }
    else {
      var method_name_path = './' + (javascript ? javascript + '/' : '') + _underscored(config.name) + '.js';
      if (_loads_method_js(config) && _.isUndefined(paths_done[method_name_path])) {
        jQuery.ajax({
          url: method_name_path,
          dataType: 'script',
          success: function () {
            paths_done[method_name_path] = method_name_path;
            clazz = _(candidates).chain()
              .map (function (pseudo_class_name) {
                return  (namespace && namespace[pseudo_class_name]) || window[pseudo_class_name];
              })
              .compact()
              .first()
              .value();
            if (clazz) {
              callback_taking_the_clazz(clazz);
            }
            else load_candidates()
          },
          error: function () {
            paths_done[method_name_path] = method_name_path;
            load_candidates();
          }
        });
      }
      else load_candidates();
      
      function load_candidates () {
        if (_loads_clazz_js(config)) {
          async.map(candidates, function (pseudo_class_name, callback_taking_an_err_and_a_clazz) {
            var js_path = './' + (javascript ? javascript + '/' : '') + _underscored(pseudo_class_name) + '.js';
            if (_.isUndefined(paths_done[js_path])) {
              jQuery.ajax({
                url: js_path,
                dataType: 'script',
                success: function () {
                  paths_done[js_path] = js_path;
                  clazz = (namespace && namespace[pseudo_class_name]) || window[pseudo_class_name];
                  callback_taking_an_err_and_a_clazz(undefined, clazz);
                },
                error: function () {
                  paths_done[js_path] = js_path;
                  callback_taking_an_err_and_a_clazz();
                }
              });
            }
            else callback_taking_an_err_and_a_clazz();
          }, function (err, clazzes) {
            callback_taking_the_clazz(_(clazzes).chain().compact().first().value());
          });
        }
        else callback_taking_the_clazz();
      }
    }
    
  }
  
  // selector is not a proper jQuery selector, just # and . expressions with parameters tossed in
  function _extract_inferences_from_renders (config) {
    if (_.isString(config.renders)) {
      var infers = config.infers || [];
      config.renders = config.renders.replace(/(\.|#)\w+:[a-z_]\w*/ig, function (found) { 
        infers.push(found);
        return ''; 
      });
      infers.length && (config.infers = infers);
    }
  }
  
  // `config.renders` provides a selector for a DOM element. If one is provided,
  // Faux will invoke the controller method to provide content whenever that
  // DOM element is rendered in the page. The selector should be restricted to
  // A string containing zero or one id (`#this_is_an_id`) and zero or more
  // classes (`.this_is_a_class`) catenated together in a string.
  //
  // `config.renders` also supports `true`, in which case Faux chooses a default
  // selector
  function _defaultize_config_dot_renders (config) {
    if (true === config.renders) {
      if (_.isString(config.name)) {
        var name = _underscored(config.name);
        if (_.isString(config.renders_pattern)) {
          config.renders = config.renders_pattern.replace(':method', name);
        }
        else config.renders = '.' + name;
        // add inferred renderings
        if (_is_singular(name)) {
          // TODO: Enable this
          //
          // Atthe moment, these are translated into default formulae, but this breaks
          // down because of a bug elsewhere: Defaults (bound to '') cannot fail
          // or we get an infinite loop
          //
          // https://github.com/unspace/faux/issues/65
          //
          // config.renders = config.renders + '#' + name + '_:' + name + '_id';
          // config.renders = config.renders + '.' + name + '_:' + name + '_id';
        }
        else if (_is_plural(name)) {
          // future home of inferences we can draw about a plural
        }
      }
      else {
        delete config.renders;
        globals.console && globals.console.log("Whoops, trying to make a default renders for a method with no name")
      }
    }
  }
  
  function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

})(window, jQuery);

/*
The MIT License

Copyright (c) 2010 Reginald Braithwaite and Unspace Interactive

http://reginald.braythwayt.com
http://unspace.ca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Portions of this code are also (c) Aaron Quint and others

http://github.com/quirkey/sammy

*/