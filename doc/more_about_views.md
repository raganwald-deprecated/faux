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
      
**models**

[Bacbone.js][b]'s views are great for managing interaction unobtrusively. Each view can have a model that serves as the source of the data displayed by its templates. The easiest way to initialize a view with data it to assign in to the `model` parameter:

    StaffView = Backbone.View.extend({
      // elided
    });

    magic_controller
      .display('staff', {
        gets: { model: '/staff/:id' }
      });

This places the raw data for a staff into the view's `model` property, where it can be rendered by the template or accessed by view methods.

Models in Backbone.js can also be managed with a [Model Class][mc] or [Collection Class][cc]. This is useful when you want to do things like automatically re-render a view when some data is updated:

    CrystalBall = Backbone.Model.extend({
      // elided
    });

    CrystalBallView = Backbone.View.extend({
      // elided
    });

    magic_controller
      .display('crystal_ball', {
        gets: '/ball/:id'
        before_display: {
          model: function (params) { return new CrystalBall(params.ball); }
        }
      });

Just as Faux is able to deduce the view class from the name of the controller method you declare, Faux is also able to deduce the name of a model class or collection class. The above declaration can just as easily be written:

    // "CrystalBall" or "CrystalBallModel" declared previously

    magic_controller
      .display('crystal_ball', {
        gets: { model: '/ball/:id' }
      });

Faux creates a new instance of `CrystalBall` and assigns it to the instance of `CrystalBallView` automatically. Faux does the same thing with backbone.js's [Collection Classes][cc] when you declare a method that looks like a plural:

    SpellCollection = Backbone.Collection.extend({
      // elided
    });

    SpellsView = Backbone.View.extend({
      // elided
    });

    magic_controller
      .display('spells', {
        gets: { model: '/spells' }
      });

Sometimes you don't want Faux creating a model class. No problem:

    FamiliarModel = backbone.Model.extend({
      // elided
    });

    magic_controller
      .display('familiars', {
        // elided
        model_clazz: false
      });
 Or you want to pick your own model class:
 

    magic_controller
      .display('familiars', {
        // elided
        model_clazz: SomeOtherModel
      });

You're always in control.

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
[cc]: http://documentcloud.github.com/backbone/#Collection
[functional]: http://osteele.com/sources/javascript/functional/
[f]: /unspace/faux/tree/master/doc/functions.md#readme
[haml]: http://haml-lang.com/ "#haml"
[jamie]: http://github.com/jamiebikies
[k]: https://github.com/raganwald/JQuery-Combinators
[mvp]:  http://github.com/raganwald/homoiconic/blob/master/2010/10/vc_without_m.md#readme "MVC, PVC and (¬M)VC"
[m]: /unspace/faux/tree/master/doc/methods.md#readme
[mc]: http://documentcloud.github.com/backbone/#Model
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
