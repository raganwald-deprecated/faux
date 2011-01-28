Faux
===

Faux is a Javascript utility for building [Single Page Interface][spi] (or "SPI") applications.

*Single Page Interface applications are much more responsive than traditional server-side client applications*. Traditional applications fetch a complete page from the server as part of every interaction. The HTTP model and the architecture of browsers imposes a large overhead on every page displayed. SPI applications load one page and thereafter all changes to the page are handled in the browser using Javascript to manipulate the DOM. Interactions with the server are handled in the background using AJAX. The result is a much faster user experience that features a finer-grained, richer model of interaction.

Faux helps you write SPI applications by providing a traditional page-centric application model, but implementing that model in the browser instead of the server. Faux applications have "pages" that are constructed using [Haml templates][haml] from models. Faux applications have "routes" that can be bookmarked.

Faux applications are familiar to anyone comfortable writing server applications using frameworks like Rails, and Faux may be the very best way to refactor a traditional server application by separating the business logic in a RESTful server from the application logic in the browser.

Faux may also be the easiest way to transition from writing server applications to SPI applications. Faux applications are built out of [Backbone.js][b]'s models, views, and controllers. But Faux isn't a framework: Faux doesn't ask you to learn a new, [non-portable][wicmajsp] abstraction in lieu of using [MVC][mvp].

Instead, Faux provides you with a very simple DSL for defining controller methods, the routes that invoke them, and the templates that should be displayed. From there you gradually add functionality as you need it: You can write View classes for handling interaction, model classes for automatically managing state in the browser, or collection classes for managing filtering and reporting of data sets. You can break pages into components and use all of Faux and backbone.js's tools—like templates, views, and models—to render and control each component. You can add finer- and finer-grained interactivity directly to the View and Model classes you write.

Dive into Faux!

**an example application**

<a target="_blank" href="http://min.us/mvkEt6y#1"><img src="http://i.min.us/jeaApo.png" border="0"/></a>

[Misadventure][play] is a little game in the style of [Adventure][a]. Misadventure is written in Javascript and runs entirely in the browser. Misadventure is written in standard Model-View-Controller style, making heavy use of the [Faux][f] and [Backbone.js][b] libraries. A three part code review has been written:

1. [Part I][pi]
2. [Part II][pii]
3. [Part III][piii]

**more reading**

* [Writing an Application with Faux][w]
* [More About Views][v]
* [Methods][m]
* [Configuration Options][c]
* [Functions][f]

**why we created faux**

We were building an application that mapped neatly onto a traditional CRUD server-side interface, however it was important for us to segregate the domain logic into a domain entity server and the UI into a separate application-specific code base. While in theory this is easy to do in a single Rails application, our experience is that in practice, domain and application logic blur. So we looked at building two Rails applications, a RESTful domain logic server and an application server using ActiveResource as model proxies.

Once we realized how much Javascript we'd be adding to support application logic in the client, the idea of having what amounts to three separate code bases became unpalatable, so we embarked on building all of the application logic into the client and keeping the domain server lean, mean, clean, and RESTful.

Thus, Faux is optimized to act as a font end for a RESTful domain logic server.

**other approaches**

Faux is not a one-size-fits-all for writing SPI applications.

* Some applications are extremely simple and don't need the support for events and interaction that views provide. A framework like [Sammy][s] might be a good choice.
* Some applications are small but need some support for interaction. Using Backbone.js directly might be the best choice, as this [example][todo] shows.
* Many client-side applications ought to feature rich and varied interaction that doesn't revolve around routes. You might want to roll your own code on top of [Backbone.js][b] or jump right into a more sophisticated tool like [Sproutcore][sprout].

**note**

*Faux was conceived on August 19, 2010 as "Roweis." A remark by Jeremy Ashkenas that we were creating a "Faux Server API" led to its new name.*

*Faux and its documentation is still a work in progress: Future additions to this documentation may or may not include discussions about handling error codes, directly invoking methods, unobtrusive handlers, and some of the other macros such as `title`, `infers`, `redirects_to`, and `location`.*

*Faux was created with the support of the [International Development Research Centre][idrc], a Canadian Crown Corporation created by the Parliament of Canada that supports research in developing countries to promote growth and development. Faux powers software used by the [Think Tank Initiative][tti], a multi-donor program dedicated to strengthening independent policy research institutions—or “think tanks” —in developing countries.*

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
[idrc]: http://publicwebsite.idrc.ca/
[tti]: http://publicwebsite.idrc.ca/EN/Programs/Social_and_Economic_Policy/Think_Tank_Initiative/Pages/default.aspx
[a]: http://www.digitalhumanities.org/dhq/vol/001/2/000009/000009.html
[f]: https://github.com/unspace/faux
[play]: http://unspace.github.com/misadventure/
[source]: http://github.com/unspace/misadventure
[b]: http://documentcloud.github.com/backbone/
[pi]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_i.md#readme
[pii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_ii.md#readme
[piii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_iii.md#readme