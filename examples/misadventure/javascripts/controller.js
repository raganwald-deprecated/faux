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
// `#/wake` invokes `controller.wake()`, just like directly calling `controller.wake()`.
// Declaring `location: true` when configuring the controller declares that when we
// directly call controller methods, we want the controller to save the current location, i.e. to
// set the fragment to `#/wake` when we directly invoke `controller.wake()`.
//
// (It's an unfortunate coïncidence that the controller option `save_location` looks an awful lot like
// it has something to do with this application's location routes and method, but that's all
// it is, a coïncidence.)
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
// The default window title shall be `Misadventure`
var controller = new Faux.Controller({
  save_location: true,
  element_selector: '.content',
  partial: 'haml',
  partial_suffix: '.haml',
  javascript: 'javascripts',
  title: 'Misadventure'
});


// Defining controller methods
// ---

// We're going to define three controller methods, `controller.wake()`, `controller.location({...})`,
// and `controller.bed({...})`
controller

// `.begin` establishes a new scope. All three method will share a common set of "translations."
// These translations tell Faux how to turn a collection of `locations` into a `seed`, and how to 
// turn a `seed` into a collection of `locations`.
  .begin({
    'seed=': {
      locations: function (locations) { return locations.seed; },
      '': function () { return Math.random().toString().substring(2); }
    },
    'locations=': {
      seed: function (seed) { return LocationCollection.find_or_create({ seed: seed }); }
    }
  })
  
    //`controller.wake()` will have a route of `#/wake`, and it will initialize its own `locations`.
    // Since there is no `WakeView` defined, it will display the parameters directly in a template 
    // of `/haml/wake.haml`.
    //
    // This also defines `route_to_wake()`.
    .method('wake')

    // `controller.bed({...})` will have a route of `#/:seed/bed` and will use a `BedView` to
    // display a template of `/haml/bed.haml`.
    //
    // This also defines `route_to_bed({ seed: '42' })`. Thanks to the translations, you can
    // also call `route_to_bed({ locations: location_collection })`.
    .method('bed', {
      route: ':seed/bed'
    })
  
    // `controller.location({...})` will have a route of `#/:seed/location_id` and will use a 
    // `LocationView` to display a template of `/haml/bed.haml`.
    //
    // This also defines `route_to_location({ seed: '42', location_id: '6' })`. Thanks to the 
    // translations, you can also call `route_to_location({ location: location })`. Faux deals
    // with some magic like extracting `location.collection` to get `locations` and `location.id`
    // to get `location_id`. This is all possible because of the translations and the use of
    // naming conventions.
    .method('location', {
      route: ':seed/:location_id'
    })
    
    // ends a `.begin({...})` scope
    .end()
  
    ;

// Kick off the application, and invoke `controller.wake()` if no fragment is provided.
$(function() {
  controller.define_all(function () {
    Backbone.history.start();
    window.location.hash || controller.wake();
  });
});
	
})();

// This file is part of [Misadventure](http://github.com/unspace/misadventure), an extremely 
// simple [adventure][a] game written as an example app for [Faux](https://github.com/unspace/faux).
// You can play the game [here](http://unspace.github.com/misadventure).
// [a]: http://www.digitalhumanities.org/dhq/vol/001/2/000009/000009.html

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