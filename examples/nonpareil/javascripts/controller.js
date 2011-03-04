// From Backbone.js's `Backbone.Controller` [documentation](http://documentcloud.github.com/backbone/#Controller):
//
// > Web applications often choose to change their URL fragment (`#fragment`) in order to provide shareable, bookmarkable URLs for an Ajax-heavy application.
//
// > `Backbone.Controller` provides methods for routing client-side URL fragments, and connecting them to actions and events.

// Start a new Javascript scope.
;(function () {

// Creating a new controller
//--

// A `Faux.Controller` instance is a `Backbone.Controller`, with additional methods added for defining routes
// by convention and providing `route_to` helpers for temnplates.
//
// Controller methods can be invoked in two ways. First, with a route. For example,
// `#/` invokes `controller.home()`, just like directly calling `controller.home()`.
// Declaring `location: true` when configuring the controller declares that when we
// directly call controller methods, we want the controller to save the current location, i.e. to
// set the fragment to `#/` when we directly invoke `controller.home()`.
//
// By default, we want to use [Backbone.Model](http://documentcloud.github.com/backbone/#Model) classes
// for everything passed to views. Since we're passing `true`, we want Faux to infer the name of
// each model from the name of the controller method, i.e. The model for `controller.location` will
// be `location`.
//
// Place content in the `div` with a class of `content`
//
// Haml partials are found in the `haml` directory, and the default suffix for haml files is `.haml`
//
// Javascript files containing models, collections, and views can be found in the `javascripts` path.
//
// The default window title shall be `Nonpareil`
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
    clazz: FibonacciView
  })
  
    .method('naive', {
      renders: 'td.naive.n_:n'
    })
  
    .method('matrix', {
      renders: 'td.matrix.n_:n'
    })
  
    .end()

  ;

// Kick off the application, and invoke `controller.table()` if no fragment is provided.
$(function() {
  controller.define_all(function () {
    Backbone.history.start();
    window.location.hash || controller.table();
  });
});
	
})();

// This file is part of [Nonpareil](http://github.com/raganwald/faux/examples/misadventure), an extremely 
// simple [adventure][a] game written as an example app for [Faux](https://github.com/raganwald/faux).

// License Terms
// ---
/*

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

To the extent possible under law, Unspace Interactive has waived all copyright 
and related or neighboring rights to the software, except for those portions
that are otherwise licensed.

This work is published from Canada.

*/