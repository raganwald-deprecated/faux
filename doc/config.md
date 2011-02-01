Configuration Options
===

**title**

Sets the window title. Equivalent to writing a snippet of code that is spliced into the `redirect` step, which takes place *after* anything is displayed. For example:

    magic_controller
      .method('spells', { title: 'Book of Magic' });

Or:

    magic_controller
      .method('vestaments', {
        route: '/vestaments/:colour',
        title: function (params) { return "Splendid " + params.colour + " Robes!"; }
      });
      
**location**

Sets the faux-route displayed in the location bar of the browser. Equivalent to writing a snippet of code that is spliced into the `redirect` step, which takes place *after* anything is displayed, but it does not actually cause a redirect of any kind.

The simplest example is this:

    magic_controller
      .method('spells', { location: true });

`lcoation: true` tells Faux to set the location to the current route. This is usually superfluous, however you might write some code that does something like this:

    magic_controller.spells();

That would display the `spells.haml` template, but if you hand't specified `location: true`, the location bar would remain unaltered. Now Faux resets the location bar so that bookmarking works properly.

This allows you to use direct method invocation to perform faux redirects instead of fooling around with URLs. For example:

    magic_controller
      .method('vestaments', {
        route: '/vestaments/:colour',
        title: function (params) { return "Splendid " + params.colour + " Robes!"; },
        location: true
      });
      
Now you can call `magic_controller.vestaments({ colour: 'blue'})` wherever you like and Faux will arrange for the title and location to be updated appropriately.

You can also manage the location more explicitly:

    magic_controller
      .method('foo', {
        location: '/fubar'
      })
      .method('bar', {
        location: function (params) { return 'bar/' + params.type; }
      })
      .method('frobbish', {
        location: '/frobbish/:type
      });
      
So far, we use `location: true` almost exclusively.

**redirects\_to**

Sets the faux-route displayed in the location bar of the browser. Equivalent to writing a snippet of code that is spliced into the `redirect` step, which takes place *after* anything is displayed, but it *does* cause the appropriate controller method to be triggered.

Example:

    SpellView = Backbone.View.extend({ ... });

    magic_controller
      .method('spell', {
        route: '/spell/:type',
        gets: '/spell/:type'
      })
      .action('invisibility', {
        redirects_to: '/spell/invisibility'
      });
      
This sets up an route `/invisibility` that redirects to `/spell/invisibility`.

**More Reading**

* [Faux][readme]
* [Writing an Application with Faux][w]
* [More About Views][v]
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
