Markdown Preview with Backbone-Style Form Handling
===

Faux applications often need to handle user input with HTML forms. In straight HTML/HTTP, the form element has `ACTION` and `METHDOD` attributes. The `ACTION` provides an URL where the form field's values will be submitted, and the `METHOD` determines whether these elements will be submitted with `GET` or `POST`. (In theory you could also submit a form with a `PUT`, however I am not aware of a browser that supports `PUT`).

This arrangement does not work in a Single Page Application ("[SPA][1]") application. It is possible to set a form's action to the page's fragment, and you could then parse `GET` parameters. However, nothing can be done about forms submitted with `POST`: Their parameters are lost. For this reason, SPAs handle form submissions directly in Javascript. Faux applications are [Backbone][2] applications, so one direct and obvious way to handle a form submission in a Faux application is to use Backbone's support for View classes.

In Faux, a Backbone View class has two responsibilities: First, it provides helper methods for the HAML temnplate that renders the HTML. Second, like all Backbone View classes, it provides handlers for various DOM events in a declarative and unobtrusive way. (Handling DOM events is what MVC pedants would call a "controller" responsibility, but Backbone uses the word "View" for this and "Controller" for the code that handles URL routing. So be it.)

The obvious way to handle a form submission is to use an event handler that responds directly to a `submit` event. The handler can process the form submission itself, or invoke a controller method and pass along the parameters. In this example, the event handler delegates the form processing to a controller method. (The example is contrived, it's quite easy to make a markdown preview that updates in real time. Nevertheless, it does show how to use a Backbone View class's event handler to process a form.)

[1]: https://secure.wikimedia.org/wikipedia/en/wiki/Single-page_application
[2]: http://documentcloud.github.com/backbone/