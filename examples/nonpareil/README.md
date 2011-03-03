**What They Said**

> "Most other frameworks don't have lazy loading as part of the core framework. It's generally very hard to do"--[Lift has built-in Lazy Loading][lazy_lift]

> "Something that's hard or impossible in other web frameworks is trivial in Lift."--[Lift can parallelize page rendering.][parallel_lift]

**What We Say**

Challenge Accepted!

Fibonacci Numbers with Lazy Parallel Rendering
---

[<font size ="+2"><b>Try Me!</b></font>][np]

Try this sample [parallel browser application][np] written with the [Faux][f] framework for building Javascript applications. This demonstrates how to render a page in separate sections, with each section using its own method. The sample shows a table of [Fibonacci numbers][wiki], but each table cell has its own view rendered by a call to `controller.matrix()`  or `controller.naive()`, and each Fibonacci number is calculated independently.

[wiki]: https://secure.wikimedia.org/wikipedia/en/wiki/Fibonacci_number

Unless your browser is lightning-fast, you will see that the browser renders all the independent cells in parallel for you.

NEW: [Fibonacci Numbers with Wiring][kt] is a similar application, but shows how to extend it to have views that update themselves when models change.

**understanding how it works**

To understand this application, have a look at Faux's [read me][f], follow the links to the introductory example application [Misadventure][play], and especially its [four][pi]-[part][pii] [code][piii] [review][piv]. The four-part code review will walk you through how a Faux application is structured. Now we can walk through this example and see how it makes lazy and parallel rendering trivial.

All Faux applications start with a controller. It's in `controller.js`:

    var controller = new Faux.Controller({
      save_location: true,
      element_selector: '.content',
      partial: 'haml',
      partial_suffix: '.haml',
      javascript: 'javascripts',
      title: 'Fibonacci in Parallel',
      model_clazz: false
    });

    controller
  
      .method('table')
  
      .begin({
        route: false,
        infers: '.n_:n',
        clazz: FibonacciView
      })
  
        .method('naive', {
          renders: 'td.naive'
        })
  
        .method('matrix', {
          renders: 'td.matrix'
        })
  
        .end()

      ;

**about "`controller.table()`":**

Faux application have methods, and those methods are usually associated with routes that are represented by URL fragments. This example application has a `.table()` method:

    controller
      .method('table')

By default, it is associated with the route fragment `#/table`, and we've set it up such that it's the default method when you open the application page. Also by default, it uses the `table.haml` template to render content for the page:

    %table
      %thead
        %th n
        %th matrix
        %th naive
      %tbody
        :each n in _.range(1, 26)
          %tr{ class: 'fibonacci n_' + n }
            %td= n
            %td{ class: 'matrix n_' + n }
              %img{ src: './images/ajax-loader.gif' }
            %td{ class: 'naive n_' + n }
              %img{ src: './images/ajax-loader.gif' }
              
This sets up a table with twenty-five rows:

    %table
      %thead
        %th n
        %th matrix
        %th naive
      %tbody
        %tr.fibonacci.n_1
          %td 1
          %td.matrix.n_1
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.n_1
            %img{ src: './images/ajax-loader.gif' }
        %tr
          %td 2
          %td.matrix.n_2
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.n_2
            %img{ src: './images/ajax-loader.gif' }
        %tr
          %td 3
          %td.matrix.n_3
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.n_3
            %img{ src: './images/ajax-loader.gif' }
        
        ...
        
        %tr
          %td 25
          %td.matrix.n_25
            %img{ src: './images/ajax-loader.gif' }
          %td.naive.n_25
            %img{ src: './images/ajax-loader.gif' }

As rendered by `table.haml`, each row of the table has three columns. The first contains a number, *n*, and the other two are reserved for n's fibonacci number, calculated in two different ways. One calculation uses [matrix math][m], the other is the naive recursive procedure`fibd(n) = fib(n-1) + fib(n-2)`. These columns are filled with a progress `.gif`. Something else fills in actual values. But what?

[m]: https://github.com/raganwald/homoiconic/blob/master/2008-12-12/fibonacci.md#readme "A program to compute the nth Fibonacci number"

**about "`controller.naive()`" and "`controller.matrix()`":**

The example application has two other methods, `controller.naive()` and `controller.matrix()`:

    controller
  
      .begin({
        route: false,
        clazz: FibonacciView
      })
  
        .method('naive', {
          renders: 'td.naive.n_:n'
        })
  
        .method('matrix', {
          renders: 'td.matrix.n_:n'
        })
  
        .end()

Just like `controller.table()`, these methods use haml templates to render their content. By default, those templates are `naive.haml`:

    %span= this.by_naive()

And `matrix.haml`:

    %span= this.by_matrix()

As you can see, the templates are remarkably simple! This is fine, because `controller.naive()` and `controller.matrix()` are not used by routes to render content on the page, they're used to render the contents of the individual table cells. Let's see how.

**about "`route: false`":**

Faux normally assigns a route to each method. If you don't supply one, Faux assumes there is one with the same name as the methods. This can be disabled with `route:false`, so we are declaring that `controller.naive()` and `controller.matrix()` cannot be invoked with routes. Likewise, there are not `route_to_matrix` or `route_to_naive` helper methods. We're disabling routes because these methods are only used to render portions of `controller.table()`'s content.

**about "`renders: 'td.naive.n_:n'`" and "`renders: 'td.matrix.n_:n'`":**

The `renders` configuration option is a vastly simplified jQuery selector with some special sauce. You are safe with an optional tag type ('td'), an optional id (not shown here, but something like `#42`), and zero or more optional classes (like `.matrix`). Faux extracts any id or class selector that has a parameter embedded in it, so Faux reads `'td.naive.n_:n'` as:

    td     <- tag selector
    .naive <- class selector
    .n_:n  <- parameter inference
    
As we saw above, `controller.table()` renders table rows such as (in HTML):

    <tr>
      <td>42</td>
      <td class='matrix n_42'><img src='./images/ajax-loader.gif'/></td>
      <td class='naive n_42'><img src='./images/ajax-loader.gif'/></td>
    </tr>

Table cells such as `<td class='matrix n_42'>...</td>` match the jQuery selector 'td.matrix' and table cells such as `<td class='naive n_42'>...</td>` match the jQuery selector 'td.naive'. After `controller.table()` has finished rendering its content, Faux invokes `controller.naive()` for each of the cells with class `naive` and `controller.matrix()` for each of the cells with class `matrix`. No routes are involved, and whatever these methods render replaces the content of their table cells.

**inferences**

Since `controller.naive()` and `controller.matrix()` are invoked by DOM elements matching their `renders` configuration and not by a route, they cannot accept a parameter embedded in the fragment (such as `#/naive/42`). Instead, Faux is able to infer parameters from their class(es) and/or ids. In this application, `.n_:n` instructs Faux that when invoking `controller.naive()` and `controller.matrix()` to render content for an element, it can infer that the parameter `n` is `42` from a class such as `n_42`. Each individual cell will be rendered by its own method being invoked, and each will get its own parameter.

Note that an inference like `.n_:n` is not a selector. If there was an element such as `<td class='matrix en_42'>...</td>` in the DOM, it would still trigger `controller.matrix()` even though there is no class to "match" `.n_:n` and provide a way to infer the parameter "n."

Inferences are always of the form `/(\.|#)\w+:[a-z_]\w*/i`

**about "`clazz: FibonacciView`":**

Faux typically attempts to infer the view class for each method from its name. The default view class for `controller.naive()` would be `NaiveView` and the default view class for `controller.matrix()` would be `MatrixView`. We prefer to have one class encapsulate both implementations, so we declare that both `controller.naive()` and `controller.matrix()` have a view class of `FibonacciView`.

Backbone.js view classes excel at providing a view of a model class that can handle events. They are also an excellent accompaniment to templates in Faux, even when a method doesn't need its own model (it is really not necessary to encapsulate an integer in a model class). In Faux, the structure of the HTML is placed in the template, and the Javascript for helpers, handling interaction, or anything else is handled in the view class. In `FibonacciView`, we provide helpers for calculating Fibonacci numbers without embedding the Javascript in the page content.

    globals.FibonacciView = Backbone.View.extend({
    
      initialize: function () {
        this.n = parseInt(this.options.n);
      },
    
      by_naive: function (n) {
        if (_.isUndefined(n)) {
          n = this.n;
        }
        if (n < 2) {
          return new BigNumber(n);
        }
        else {
          var previous = this.by_naive(n - 1);
          var double_previous = this.by_naive(n - 2);
          return previous.add(double_previous);
        }
      },
    
      by_matrix: (function () {
      
        function times () {
          return _(arguments).chain()
            .rest()
            .reduce(function (product, matrix) {
              var a = product[0], b = product[1], c = product[2];
              var d = matrix[0],  e = matrix[1],  f = matrix[2];
              return [a.multiply(d).add(b.multiply(e)), a.multiply(e).add(b.multiply(f)), b.multiply(e).add(c.multiply(f))];
            }, _(arguments).first())
            .value()
        }
      
        function power (matrix, n) {
          if (n === 1) {
            return matrix;
          }
          else {
            var halves = power(matrix, Math.floor(n/2));
          
            if ((n % 2) === 0) {
              return times(halves, halves);
            }
            else return times(halves, halves, matrix);
          }
        }
      
        var one_one_zero = [
          new BigNumber(1),
          new BigNumber(1),
          new BigNumber(0)
        ]
      
        return function (n) {
          if (_.isUndefined(n)) {
            n = this.n;
          }
          if (n < 2) {
            return new BigNumber(n);
          }
          else return power(one_one_zero, n - 1)[0];
        }
      
      })()
    
    });

Lazy and Parallel Loading in Faux
---

You can see from the configuration that our example application performs lazy rendering in Faux. We can break a page into components, and each component is rendered independently. In Lift, this rendering takes place on the server and the rendered content is sent to the browser. Faux renders the content on the browser, separation of concerns is Faux's core value proposition: All of the application logic is in one place, the browser's Single Page Application, and the server concerns itself with domain logic, authorization, and persistence. But both types of application can render components hierarchal and lazily.

Unless your browser is ridiculously fast, you will see that Faux renders each component in parallel. As noted above, the rendering is always performed in the browser. If data is required from the server to render components, the requests are performed in parallel and the results rendered in parallel as well. This is a strength of Faux's declarative configuration: The parallelization of rendering is an implementation detail, not an explicit feature to be invoked by the programmer.

**summary**

Lift is a web development framework based on the Scala programming language. It does have some interesting and useful features. Two of those features are lazy rendering of content and rendering of content in parallel. Lazy rendering of content is trivial to perform in Faux using the `renders` and `infers` configuration options. Parallel rendering is an implementation detail and requires no programmer effort.

Also, [Fibonacci Numbers with Wiring][kt] is a similar application, but shows how to extend it to have views that update themselves when models change.

[f]: http://github.com/unspace/faux
[np]: http://raganwald.github.com/nonpareil
[kt]: http://raganwald.github.com/knob_and_tube
[lazy_lift]: http://seventhings.liftweb.net/lazy "Lift has built-in Lazy Loading"
[parallel_lift]: http://seventhings.liftweb.net/parallel "Lift can parallelize page rendering"
[mis]: http://github.com/
[play]: http://unspace.github.com/misadventure/
[pi]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_i.md#readme
[pii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_ii.md#readme
[piii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_iii.md#readme
[piv]: http://github.com/raganwald/homoiconic/tree/master/2011/02/misadventure_part_iv.md#readme