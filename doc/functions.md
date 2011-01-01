Functions
===

As described in [Methods][m] and the [README][r], you can supply a function to be used as a step or as `before_` or `after_` step advice. There are a couple of different ways to specify a function.

The simplest is a function that does something for side-effects:

    before_display: function () {
      window.console && console.log('some debugging information');
    }

You can access the parameters:

    after_display: function (params) {
      window.console && console.log('some debugging information', params);
    }

Since that function doesn't return anything, the parameters would not be affected. If you want to change or augment the parameters, simply return a hash:

    before_display: function (params) {
      params.ul = jQuery('.some_class#' + params.id);
      return params;
    }

Faux has its own options. You can access them if you think you know what you are doing. This is a sharp knife and is not supported:

    fetch_data: function (params, options) {
      window.console && console.log('let\'s take a peek', options);
    }
    
Finally, you can define a function that takes a callback. You must declare all three parameters and Faux will pass you a callback that you must call unless there is an error of some sort. You must pass in the params and the options:

    fetch_data: function (params, options, callback) {
      jQuery.get(some_url, { ... }, success);
      
      function success (data, textStatus, XMLHttpRequest) {
        // do something
        params.more_data = data;
        callback(params, options);
      }
    }
    
**recursion: see recursion**

When Faux expects a function, there are three rules:

*Rule One*: If Faux expects a function and you supply a function, Faux takes the function.
*Rule Two*: If Faux expects a function and you supply something that is not a function but it implements a method called `.toFunction()`, Faux calls `.toFunction()` and accepts the result.

Rule Two is easy to understand. For example, if you use `String.prototype.toFunction()` from [Functional Javascript][functional], every string implements to `.toFunction()` method. Therefore, you can do something like this:

    before_display: "window.console && console.log('some debugging information')"

*Rule Three* is that if Faux expects a function and you supply a hash that is not a function and does not implement the `.toFunction()` method, Faux constructs a function that takes the parameters as an argument and returns a new hash. The new hash consists of each of the keys of your hash, but the values will be interpreted as functions.

And example is worth a thousand words. This example using Rule Three:

    before_display: {
      
      id: function (params) {
        return params.castle.id;
      },
      
      model: function (params) {
        return params.castle;
      },
      
      el: function (params) {
        return jQuery('.properties#'+params.castle.id);
      }
      
    }

Is equivalent to this example using Rule One:

    before_display: function (params) {
      return {
        id:    params.castle.id,
        model: params.castle,
        el:    jQuery('.properties#'+params.castle.id)
      };
    }

Why bother? Well, if you don't use Functional Javascript or anything else like that, it may not be worth the trouble. However, consider this version using Functional Javascript and Rule Two:

    before_display: {
        id:    ".castle.id",
        model: ".castle",
        el:    "jQuery('.properties#'+_.castle.id)"
    }
    
*More to Come*

[functional]: http://osteele.com/sources/javascript/functional/
[m]: ./methods.md#readme
[r]: ../README.MD#readme