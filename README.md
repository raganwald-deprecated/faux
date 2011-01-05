Faux
===

Faux is a Javascript utility for building [Single Page Interface][spi] (or "SPI") applications using the [Backbone][b] library's models, views, and controllers. Faux isn't a framework: Faux doesn't ask you to learn a new, [non-portable][wicmajsp] abstraction in lieu of using MVC (we actually call it MVP, but [that's another story][mvp]). Instead, Faux provides you with a very simple DSL for declaring view classes and wiring them up to a controller that implements client-side routes.

Faux applications strongly resemble traditional server-side client applications. They are route-centric. While a server application might have routes like `http://prestidigitation.unspace.ca/spells/` or `/ingredients/42`, Faux applications have faux-routes like `/#/spells/` and `/#/ingredients/42`.

This approach is not a one-size-fits-all for writing SPI applications.

* Some applications are extremely simple and don't need the support for events and interaction that views provide. A framework like [Sammy][s] might be a good choice.
* Some applications are small but need some support for interaction. Using Backbone directly might be the best choice, as this [example][todo] shows.
* Many client-side applications ought to feature rich and varied interaction that doesn't revolve around routes. You might want to roll your own code on top of [Backbone][b] or jump right into a more sophisticated tool like [Sproutcore][sprout].

Our bet is that Faux is a good choice for applications with lots of functions that break neatly down into "pages," but fairly straightforward interactions on each page. For these applications, you may want to provide users with the benefits of a web interface they already understand: bookmarkable, back-buttonable locations. We're also betting that  a declarative syntax for defining the skeleton of your application is easier to maintain than a collection of classes wired together in an ad hoc fashion, so much so that if Faux isn't for you, you'll probably end up rolling something similar for yourself that is closely tailored to your needs.

**our motivation**

In our own case, we were building an application that mapped neatly onto a traditional CRUD server-side interface, however it was important for us to segregate the domain logic into a domain entity server and the UI into a separate application-specific code base. While in theory this is easy to do in a single Rails application, our experience is that in practice, domain and application logic blur. So we looked at building two Rails applications, a RESTful domain logic server and an application server using ActiveResource as model proxies.

Once we realized how much Javascript we'd be adding to support application logic in the client, the idea of having what amounts to three separate code bases became unpalatable, so we embarked on building all of the application logic into the client and keeping the domain server lean, mean, clean, and RESTful.

Thus, Faux is optimized to act as a font end for a RESTful domain logic server.

**note**

*Faux was conceived on August 19, 2010 as "Roweis." A remark by Jeremy Ashkenas that we were creating a "Faux Server API" led to its new name.*

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
