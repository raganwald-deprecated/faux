Methods
===

**steps**

By default, there are five steps that are executed in order: `['get_params', 'fetch_data', 'transform', 'display', 'redirect']`.

**more about writing your own steps**

As mentioned in the [readme][readme], you can write your own function and slot it in the options like this:

    magic_controller
      .method('coven', {
        gets: { models: '/witches' },
        transform: function (parameters) {
          return {
            model: {
              models: parameters.models,
              length: parameters.models.length
            }
          };
        }
      });

In this case, we're transforming parameters of:

    {
      models: [ ... ]
    }

Into:

    {
      model: {
        models: [ ... ],
        length: 3
      }
    }

There are some subtleties, of course. Sometimes you don't want to change the parameters, you just want to do something of your own. No problem, if your function doesn't return anything, Faux leaves the parameters untouched:

    function (parameters) {
      window.console && console.log(parameters);
    }
    
Another is that Faux actually passes three parameters to each function. The first is the `parameters` that you often want to read or manipulate. The second is some `options` that Faux uses privately for its own purposes. Obviously, you mess with those at your peril. If you're curious, you can write:

    function (parameters, options) {
      window.console && console.log(options);
    }

The third parameter is quite important. Faux doesn't actually chain the functions together as shown above in our "ridiculously simple" example. If it did, it couldn't handle the case where a function returns nothing. Also, it couldn't handle asynchronous operations like fetching the template from the server or for that matter, fetching data from the server.

Like many other Javascript code bases, Faux uses [Continuation-Passing Style][cps] (or "CPS") to chain the functions together. If you declare a function with one or two parameters, Faux assumes that your function is synchronous and calls your function then calls any subsequent functions immediately after your function returns.

Therefore, if you write something like:

    transform: function (parameters) {
      jQuery.get('/somequery', parameters, function (data, textStatus, XMLHttpRequest) {
        do_something(data);
      }, 'json');
    }
    
Your function will return immediately and `do_something(data)` will get called whenever jQuery receives a response from the server. If you want to perform an action before the method moves onto the next step, you need to write a function taking all three parameters, like this:

    transform: function (parameters, options, callback) {
      jQuery.get('/foo/bar', parameters, function (data, textStatus, XMLHttpRequest) {
        parameters.fubar = data;
        callback(parameters, options);
      }, 'json');
    }
    
Now Faux will assume that you are managing the chain of steps and will pass the future of the method chain as the `callback` parameter.

**More Reading**

* [Faux][readme]
* [Writing an Application with Faux][w]
* [More About Views][v]
* [Methods][m]
* [Configuration Options][c]
* [Functions][f]

*Faux and its documentation is still a work in progress: Future additions to this document may or may not include discussions about handling error codes, directly invoking methods, unobtrusive handlers, and some of the other macros such as `title`, `infers`, `redirects_to`, and `location`.*

[aanand]: http://github.com/aanand/
[api]: http://www.joelonsoftware.com/articles/APIWar.html "How Microsoft Lost the API War"
[b]: http://documentcloud.github.com/backbone/
[cloud]: http://getcloudkit.com/
[core]: http://www.ridecore.ca "CORE BMX and Boards"
[couch]: http://couchdb.apache.org/
[cps]: http://en.wikipedia.org/wiki/Continuation-passing_style "Continuation-passing style - Wikipedia, the free encyclopedia"
[c]: /unspace/faux/tree/master/doc/config.md#readme
[functional]: http://osteele.com/sources/javascript/functional/
[f]: /unspace/faux/tree/master/doc/functions.md#readme
[haml]: http://haml-lang.com/ "#haml"
[jamie]: http://github.com/jamiebikies
[k]: https://github.com/raganwald/JQuery-Combinators
[mvp]:  http://github.com/raganwald/homoiconic/blob/master/2010/10/vc_without_m.md#readme "MVC, PVC and (¬M)VC"
[m]: /unspace/faux/tree/master/doc/methods.md#readme
[prg]: http://en.wikipedia.org/wiki/Post/Redirect/Get
[raganwald]: http://github.com/raganwald
[read]: http://weblog.raganwald.com/2007/04/writing-programs-for-people-to-read.html "Writing programs for people to read"
[readme]: /unspace/faux/tree/master/docREADME.md#readme
[sinatra]: http://www.sinatrarb.com/
[spa]: http://en.wikipedia.org/wiki/Single_page_application "Single Page Application"
[spi]: http://itsnat.sourceforge.net/php/spim/spi_manifesto_en.php "The Single Page Interface Manifesto"
[sprout]: http://www.sproutcore.com/
[s]: http://github.com/quirkey/sammy "sammy_js"
[todo]: http://documentcloud.github.com/backbone/examples/todos/index.html
[t]: https://github.com/raganwald/homoiconic/blob/master/2008-10-30/thrush.markdown
[v]: /unspace/faux/tree/master/doc/more_about_views.md#readme
[w]: /unspace/faux/tree/master/doc/writing.md#readme
[wicmajsp]: http://raganwald.posterous.com/why-i-call-myself-a-javascript-programmer "Why I Call Myself a Javascript Programmer"
