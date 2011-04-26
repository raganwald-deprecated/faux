Redirection
===

Faux controller methods can be invoked directly. Given:

    controller
      .method('substitute');

Calling `controller.substitute()` is exactly the same thing invoking the url fragment `#/substitute` in the browser. Faux makes it easy to simulate redirections by changing the url fragment, but in this example we are going to show how to simulate a redirection by directly calling a controller method. In our example, we have an `original` method and a `substitute` method, and the original is going to invoke the substitute method. We aren't going to dress it up with a use case, but if you like this type of thing, imagine an application where you need to establish a user preference before displaying something. For example, you might need a currency before displaying a price. Or perhaps you need a language before displaying any page in the application. Such an application might need to check preferences before displaying certain pages, and redirect to a set preference page.

But this example isn't going to do any of that. It's just going to redirect. There are two pages: the `original` and the `substitute`. When a user tries to get to the original, he ends up at the substitute. Reading the code, you will see that the redirection happens in a `before_display` function. This is where you would put code that checks preferences. If you need to check preferences for many different controller methods, you could use a scope so that they would all share the same `before_display` code.

There are various alerts scattered through the code. None of these should appear. Their purpose is to demonstrate that having redirected, the original controller method is entirely abandoned. This happens when a `before_display` method returns `false`.