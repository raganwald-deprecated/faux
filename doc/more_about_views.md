More About Views
===

**a little more about convention over configuration when declaring views**
      
We know it's a question of taste, but if you like convention over configuration, you can also write:

    VestamentsView = Backbone.View.extend({ ... });

    magic_controller
      .display('vestaments', {
        route: '/vestaments/:colour'
      });
      
If you don't specify a `clazz` but Faux can find a view class that is named after your method, Faux will use it. That works for methods that look like they're singular or plural:

    ThaumaturgyView = Backbone.View.extend({ ... });

    magic_controller
      .display('thaumaturgy', { ... ); // infers clazz: ThaumaturgyView

There's another special case for method names that look like plurals:

    SpellCollectionView = Backbone.View.extend({ ... });
    
    magic_controller
      .display('spells', { ... }); // infers clazz: SpellCollectionView if it can't find SpellsView first
      
If you don't want a view class, you can always insist:

    magic_controller
      .display('something', {
        clazz: false
      });

We're not big fans of global namespace clutter. If you feel the same way, start like this:

    window.ca || (window.ca = {});
    window.ca.unspace || (window.ca.unspace = {});

    magic_controller = new Faux.Controller({ 
      element_selector: '.base',
      partial: 'hamljs',
      partial_suffix: '.haml',
      namespace: ca.unspace     // <--- lookie here
    });
    
And now you can write:

    ca.unspace.VestamentsView = Backbone.View.extend({ ... });

    magic_controller
      .display('vestaments', {
        route: '/vestaments/:colour'
      });
  
Some folks are big fans of point-free syntax and anonymous functions. Faux digs your groove, too:

    magic_controller
      .display('vestaments', {
        route: '/vestaments/:colour',
        clazz: {
          // equivalent to Backbone.View.extend({ ... })
        }
      });

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
