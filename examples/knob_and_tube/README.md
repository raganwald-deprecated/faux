**What They Said**

> "Using Wiring, you can create very complex inter-relationships with the elements on the screen. When one is updated, all the dependent elements update automatically. "--[Lift and its wiring.][wiring]

**What We Say**

Challenge Accepted!

Fibonacci Numbers with Wiring
---

[<font size ="+2"><b>Try Me!</b></font>][kt]

Try this sample [browser application][kt] written with the [Faux][f] framework for building Javascript applications and [Backbone.js][bb]'s model, view, and controller classes. This demonstrates how to wire views to models, such that a change to a model causes any dependent views to re-render themselves in the DOM automatically. You will see a table with three columns, a number "n" in the first column,and its Fibonacci number, calculated two different ways, in the second and third columns.

Click on any of the numbers in the first column. You will see the number you clicked on get "swapped" with one other randomly selected number. You will see the Fibonacci numbers recalculate themselves accordingly. This effect is achieved entirely with Backbone.js's support for wiring dependent views to models, and in this brief overview we'll see how Faux makes it easy to structure this kind of application.

(This application builds on another example demonstrating [lazy and parallel page rendering][np]. You may want to review that example first.)

[wiki]: https://secure.wikimedia.org/wikipedia/en/wiki/Fibonacci_number

**understanding how it works**

To understand this application, have a look at Faux's [read me][f], follow the links to the introductory example application [Misadventure][play], and especially its [four][pi]-[part][pii] [code][piii] [review][piv]. The four-part code review will walk you through how a Faux application is structured. Then have a look at another example demonstrating [lazy and parallel page rendering][np].

Now we can walk through this example and see how it makes wiring dependencies trivial.

All Faux applications start with a controller. It's in `controller.js`:

    var controller = new Faux.Controller({
      save_location: true,
      element_selector: '.content',
      partial: 'haml',
      partial_suffix: '.haml',
      javascript: 'javascripts',
      clazz: true,
      title: 'Fibonacci Numbers with Wiring'
    });

    controller
  
      .method('values', {
        'values=': function () { return new ValueCollection(); }
      })
  
      .begin({
        route: false,
        'model=': {
          'values, value_id': function (values, value_id) { return values.get(value_id); }
        }
      })
  
        .method('value', {
          renders: 'td.value.value_id_:value_id'
        })
    
        .method('naive', {
          renders: 'td.naive.value_id_:value_id'
        })

        .method('matrix', {
          renders: 'td.matrix.value_id_:value_id'
        })

        .end()

      ;

    // Kick off the application, and invoke `controller.values()` if no fragment is provided.
    $(function() {
      controller.define_all(function () {
        Backbone.history.start();
        globals.location.hash || controller.values();
      });
    });

**about "`controller.values()`":**

Faux application have methods, and those methods are usually associated with routes that are represented by URL fragments. This example application has a `.values()` method:

      .method('values', {
        'values=': function () { return new ValueCollection(); }
      })

By default, it is associated with the route fragment `#/values`, and we've set it up such that it's the default method when you open the application page. We've also added a default calculation that assigns a new `ValueCollection` to `values`. Looking in the project, we see that there's a `values.js` file that defines a Backbone Collection:

    globals.ValueCollection = Backbone.Collection.extend({
  
      initialize: function () {
        this.refresh(
          _.range(1, 26).map(function (n) {
            return new Backbone.Model({ id: n, n: n });
          })
        );
      }
  
    });
    
Because we don't define our own `ValuesView`, Faux defines a default view class for us (`Backbone.View.extend({})`). It renders the page with `values.haml` by default:

    %table
      %thead
        %th n
        %th matrix
        %th naive
      %tbody
        :each value in this.model.models
          %tr
            %td{ class: 'value value_id_' + value.id }
            %td{ class: 'matrix value_id_' + value.id }
              %img{ src: './images/ajax-loader.gif' }
            %td{ class: 'naive value_id_' + value.id }
              %img{ src: './images/ajax-loader.gif' }
              
This sets up a table with twenty-five rows:

    %table
      %thead
        %th n
        %th matrix
        %th naive
      %tbody
        %tr.fibonacci.n_1
          %td.value.value_id_1
          %td.matrix.value_id_1
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.value_id_1
            %img{ src: './images/ajax-loader.gif' }
        %tr
          %td.value.value_id_2
          %td.matrix.value_id_2
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.value_id_2
            %img{ src: './images/ajax-loader.gif' }
        %tr
          %td.value.value_id_3
          %td.matrix.value_id_3
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.value_id_3
            %img{ src: './images/ajax-loader.gif' }
        
        ...
        
        %tr
          %td.value.value_id_25
          %td.matrix.value_id_25
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.value_id_25
            %img{ src: './images/ajax-loader.gif' }

As rendered by `values.haml`, each row of the table has three columns. The first contains a number, *n*, and the other two are reserved for n's fibonacci number, calculated in two different ways. One calculation uses [matrix math][m], the other is the naive recursive procedure`fibd(n) = fib(n-1) + fib(n-2)`. These columns are filled with a progress `.gif`. Something else fills in actual values. But what?

[m]: https://github.com/raganwald/homoiconic/blob/master/2008-12-12/fibonacci.md#readme "A program to compute the nth Fibonacci number"

**about "`controller.value()`," "`controller.naive()`" and "`controller.matrix()`":**

The example application has three other methods, `controller.value()`, `controller.naive()` and `controller.matrix()`:

    controller
    
      .begin({
        route: false,
        'model=': {
          'values, value_id': function (values, value_id) { return values.get(value_id); }
        }
      })
  
        .method('value', {
          renders: 'td.value.value_id_:value_id'
        })
    
        .method('naive', {
          renders: 'td.naive.value_id_:value_id'
        })

        .method('matrix', {
          renders: 'td.matrix.value_id_:value_id'
        })

        .end()

Faux associates a default view class with `controller.value()`, but we've defined two of our own view classes, `NaiveView`, and `MatrixView`. We'll discuss the exact code a little later. Just like `controller.values()`, these methods use haml templates to render their content. `value.haml` is remarkably simple:

    %span= this.n()

`naive.haml` and `matrix.haml` are equally simple:

    %span= this.fibonacci()

As you can see, the templates are remarkably simple! This is fine, because `controller.value()`, `controller.naive()` and `controller.matrix()` are not used by routes to render content on the page, they're used to render the contents of the individual table cells. Let's see how.

**about "`route: false`":**

Faux normally assigns a route to each method. If you don't supply one, Faux assumes there is one with the same name as the methods. This can be disabled with `route:false`, so we are declaring that `controller.value()`, `controller.naive()` and `controller.matrix()` cannot be invoked with routes. Likewise, there are not `route_to_matrix` or `route_to_naive` helper methods. We're disabling routes because these methods are only used to render portions of `controller.values()`'s content.

**about "`renders: 'td.value.value_id_:value_id'`," "`renders: 'td.naive.value_id_:value_id'`" and "`renders: 'td.matrix.value_id_:value_id'`":**

The `renders` configuration option is a vastly simplified jQuery selector with some special sauce. You are safe with an optional tag type ('td'), an optional id (not shown here, but something like `#42`), and zero or more optional classes (like `.matrix`). Faux extracts any id or class selector that has a parameter embedded in it, so Faux reads `'td.value.value_id_:value_id'` as:

    td                   <- tag selector
    .value               <- class selector
    .value_id_:value_id  <- parameter inference
    
As we saw above, `controller.values()` renders table rows such as (in HTML):

    <tr>
      <td class='value value_id_42'></td>
      <td class='matrix value_id_42'><img src='./images/ajax-loader.gif'/></td>
      <td class='naive value_id_42'><img src='./images/ajax-loader.gif'/></td>
    </tr>

Table cells such as `<td class='matrix value_id_42'>...</td>` match the jQuery selector 'td.matrix' and table cells such as `<td class='naive value_id_42'>...</td>` match the jQuery selector 'td.naive'. After `controller.values()` has finished rendering its content, Faux invokes `controller.value()` for each of the cells with class `value`, `controller.naive()` for each of the cells with class `naive` and `controller.matrix()` for each of the cells with class `matrix`. No routes are involved, and whatever these methods render replaces the content of their table cells.

**inferences**

Since `controller.value()`, `controller.naive()` and `controller.matrix()` are invoked by DOM elements matching their `renders` configuration and not by a route, they cannot accept a parameter embedded in the fragment (such as `#/naive/42`). Instead, Faux is able to infer parameters from their class(es) and/or ids. In this application, `.value_id_:value_id` instructs Faux that when invoking `controller.naive()` and `controller.matrix()` to render content for an element, it can infer that the parameter `value_id` is `42` from a class such as `value_id_42`. Each individual cell will be rendered by its own method being invoked, and each will get its own parameter.

Note that an inference like `.value_id_:value_id` is not a selector. If there was an element such as `<td class='matrix frobbish_42'>...</td>` in the DOM, it would still trigger `controller.matrix()` even though there is no class in the DOM to "match" `.value_id_:value_id` and provide a way to infer the parameter `value_id`.

(note: Inferences are always of the form `/(\.|#)\w+:[a-z_]\w*/i`).

**about "`model=`":**

Faux lets us define calculations for parameters. This one:

    'model=': {
      'values, value_id': function (values, value_id) { return values.get(value_id); }
    }

Tells Faux how to determine the parameter `model` given `values` and `value_id`. `model` is a useful parameter: Unless you instruct Faux otherwise, the `model` parameter will be passed on to the method's view. We saw above how Faux will inter the `view_id` from a class, and now we see how it can combine this with `values` to get at a model instance that Faux will wire to the view.

**more about view classes**

Backbone.js view classes excel at providing a view of a model class that can handle events. In Faux, the structure of the HTML is placed in the template, and the Javascript for helpers, handling interaction, or anything else is handled in the view class. In `NaiveView` and `MatrixView`, we define helpers for calculating the Fibonacci number given a model's value of `n`:
  
    globals.NaiveView = Backbone.View.extend({
    
      initialize: function () {
        this.model.bind('change:n', this.render);
      },
    
      n: function () {
        return parseInt(this.model.attributes.n);
      },
    
      fibonacci: function (n) {
        // ...
      }
    
    });

    globals.MatrixView = Backbone.View.extend({
    
      initialize: function () {
        this.model.bind('change:n', this.render);
      },
    
      n: function () {
        return parseInt(this.model.attributes.n);
      },
    
      fibonacci: (function () {
      
        return function (n) {
          // ...
        }
      
      })()
    
    });
    
You can read the exact code for calculating Fibonacci numbers in the sources. The interesting thing is the "wiring" that connects the model to the view. Since we provided a calculation for the `model` parameter, Faux automatically initializes each instance of our views with a value model. The value model is initialized with an `id` and a value for `n`. By itself, this would be enough for our views to display the Fibonacci numbers when the page is first displayed.

But what if the model were to change? How would the page update itself? have a look at this line of code from the `initialize` method:

    this.model.bind('change:n', this.render);

That binds the view's `render` method to the model's `change` event, with the consequence that that any change to `n` will cause the view to re-render. Faux has already bound the view to the element it renders, and it simply renders itself again with the help of its template. So what might cause a model to change? Let's look at `ValueView`:

    globals.ValueView = Backbone.View.extend({
  
      initialize: function () {
        this.model.bind('change:n', this.render);
      },
    
      n: function () {
        return parseInt(this.model.attributes.n);
      },
    
      events: {
        'click': 'swap'
      },
    
      swap: function () {
        var this_n = this.n();
        var that_model = this.model.collection.get(1 + Math.floor(Math.random() * this.model.collection.size()));
        var that_n = that_model.attributes.n;
        this.model.set({ n: that_n });
        that_model.set({ n: this_n });
      }
  
    });

Like `NaiveView` and `MatrixView`, `ValueView` is wired to its model so that changes to the model's `n` attribute will cause the view to re-render. But it has two other interesting definitions: `events` and a `swap` function. In Backbone.js, `events` defines a mapping between DOM events and view instance methods. `'click': 'swap'` instructs Backbone.js to bind the `swap` function to click events on the DOM element rendered by `ValueView`. Or in simpler terms, "When the user clicks on the cell representing the value, call the swap function."

The swap function is interesting. What it does is swap the `n` attributes for the view's model and another, randomly selected model. (Once in a while it will swap with itself, viewers playing at home can review the commit history and see a longer version of the code that eliminates this edge case). Notice it doesn't swap models: If it swapped models, nothing would change, since the views are listening for model changes! Instead, it leaves the models as is but changes the `n` attributes with the `.set` method. A side-effect of using `.set` is that it fires a `change` event on the model. Thus, both affected models fire change events. Each one of those has three views listening for change events, so the views update accordingly when you click on the value in the first column.

[Try it][kt]: click on any of the numbers in the first column. You will see the values swap and the Fibonacci numbers swill be recalculated automatically. The swap function doesn't know anything about what needs to be recalculated ore re-rendered, it doesn't even tell its own view to re-render, the "wiring" of views to change events takes care of that.

**comparison to the previous example**

This application is a modification of an example application that showed [lazy and parallel rendering][np]. What's different?

1. Instead of calculating `n` with an `:each` loop in haml, we built a collection of models.
2. Instead of passing `n` around directly, we wrapped it in a vanilla Backbone model. We don't declare the model, since we aren't interested in writing any methods on it, but we can still take advantage of change propagation. Essentially, we are working with `{ attributes: { n: ... }}` instead of `n`.
3. We declared a view for each of the three columns instead of just the second two. Adding a view for the first column ensures that its number updates when we perform a swap, and also gives us a plac eto put the `swap` function.
4. We added an `initialize` method to each view that wired it to the model.

**summary**

Lift is a web development framework based on the Scala programming language. It does have some interesting and useful features. One of these features is automatically updating dependents when precedent objects change. Automatically updating dependent content is handled easily by Faux's underlying Backbone.js models and views, and Faux provides a structure for declaring those relationships with each other.

p.s. Faux is actually smart enough to wire _any_ view's render method to its single model's change event by convention, but we wanted to show you how easy it is to do it by hand, because you may want to have more complex dependencies such as a single view depending on multiple models.

[f]: http://github.com/unspace/faux
[kt]: http://unspace.github.com/faux/examples/knob_and_tube
[np]: http://unspace.github.com/faux/examples/nonpareil
[lazy_lift]: http://seventhings.liftweb.net/lazy "Lift has built-in Lazy Loading"
[parallel_lift]: http://seventhings.liftweb.net/parallel "Lift can parallelize page rendering"
[mis]: http://github.com/
[play]: http://unspace.github.com/faux/examples/misadventure/
[pi]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_i.md#readme
[pii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_ii.md#readme
[piii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_iii.md#readme
[piv]: http://github.com/raganwald/homoiconic/tree/master/2011/02/misadventure_part_iv.md#readme
[bb]: http://documentcloud.github.com/backbone/
[wiring]: http://seventhings.liftweb.net/wiring