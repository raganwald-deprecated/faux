Markdown Preview with Backbone-Style Form Handling
===

Faux applications often need to handle user input with HTML forms. In straight HTML/HTTP, the form element has `ACTION` and `METHOD` attributes. The `ACTION` provides an URL where the form field's values will be submitted, and the `METHOD` determines whether these elements will be submitted with `GET` or `POST`. (In theory you could also submit a form with a `PUT`, however I am not aware of a browser that supports `PUT`).

This arrangement does not work in a Single Page Application ("[SPA][1]") application. It is possible to set a form's action to the page's fragment, and you could then parse `GET` parameters. However, nothing can be done about forms submitted with `POST`: Their parameters are lost. For this reason, SPAs handle form submissions directly in Javascript. Faux applications are [Backbone][2] applications, so one direct and obvious way to handle a form submission in a Faux application is to use Backbone's support for View classes.

In Faux, a Backbone View class has two responsibilities: First, it provides helper methods for the HAML template that renders the HTML. Second, like all Backbone View classes, it provides handlers for various DOM events in a declarative and unobtrusive way. (Handling DOM events is what MVC pedants would call a "controller" responsibility, but Backbone uses the word "View" for this and "Controller" for the code that handles URL routing. So be it.)

The obvious way to handle a form submission is to use an event handler that responds directly to a `submit` event. The handler can process the form submission itself, or invoke a controller method and pass along the parameters. In this (highly contrived) example, the event handler delegates the form processing to a controller method. Here's how it works: The default method, `input`, displays a form containing a text area and a submit button. The form doesn't have an action or a method, since Backbone will handle the submit event.

The view class, `InputView`, handles the submit event by extracting the value of the text area and invoking `controller.output`. That method uses its own view class to perform a Markdown conversion using the [Showdown][3] library, and that's what is displayed. So what we have is a few extra moving parts to display a markdown preview. While this is inelegant, it does display how to handle a form submit event in a view class and how to delegate the handling to a controller method.

This isn't the only way. You could also do all of the work in the view class. That makes sense when the "business logic" for the form's handling belongs in the one method. However, if your handling involves displaying another faux-page, or going to a server via ajax, or otherwise behaving like a controller method, making it a controller method makes sense.

[1]: https://secure.wikimedia.org/wikipedia/en/wiki/Single-page_application
[2]: http://documentcloud.github.com/backbone/
[3]: http://github.com/coreyti/showdown