;(function ($, undefined) {

// BedView
// ---
//
// The `BedView` handles what the user sees when they escape the maze and "wake up in their own bed."
//
// As noted above, view classes in Backbone.js are usually all about displaying updated models and handling events.
// Since Misadventure's models are read-only, we don't need to worry about much in the way of wiring
// change events.
//
// The main piece of business in `BedView` is some `jQuery` work yo style a map of the maze. This could
// be embedded in the DOM, but it is far more elegant to put it here.

// Define `BedView` in global scope.
window.BedView = Backbone.View.extend({
  
  // Faux composes `.after_render()` with the main `.render()` code that displays `/haml/bed.haml`.
  // The template will have drawn a table with one cell per location. Now `.after_render()` will
  // decorate the table.
  //
  // One key piece of this code checks to see whether the browser supports link color sniffing.
  // Users are shown a different color for links that have been visited. If javascript can see that
  // same change of color, we can determine which locations the user has visited without needing
  // to store them in memory. We then show them as white, while the unvisited locations are yellow.
  //
  // If we can't sniff link colors, we show all locations as white.
  //
  // We also check for passageways between locations and set styles on the table cells accordingly/
  // CSS renders a passageway by removing the boder between cells, the overall effect is to display a maze.
  after_render: function () {
    var link_el = document.createElement('a');
    $(link_el).addClass('link_test');
    link_el.href = this.options.controller.route_to_bed({locations: this.options.locations}); // this page!
    var color = this._get_computed_color(link_el);
    var cant_sniff = (color != 'rgb(255, 0, 0)');
    this.options.locations.each(function (location) {
      var cell = jQuery('#'+location.id);
      if (cant_sniff) {
        cell.addClass('visited');
      }
      else {
        link_el.href = this.options.controller.route_to_location({location:location});
        color = this._get_computed_color(link_el);
        (color == 'rgb(255, 0, 0)') && cell.addClass('visited');
      }
      location.passage_north() && cell.addClass('passage_north');
      location.passage_east() && cell.addClass('passage_east');
      location.passage_south() && cell.addClass('passage_south');
      location.passage_west() && cell.addClass('passage_west');
    }, this);
  },
  
  
  // A helper for `after_render`
  _get_computed_color: function (el) {
    var fn;
    if (_.isUndefined(el.currentStyle)) {
      fn = function (el) {
        return document.defaultView.getComputedStyle(el, '').getPropertyValue("color");
      }
    }
    else {
      fn = function (el) {
        return el.currentStyle['color'];
      }
    }
    this._get_computed_color = fn;
    return fn(el);
  }

});

})(jQuery);

// This file is part of [Misadventure](http://github.com/raganwald/faux/examples/misadventure), an extremely 
// simple [adventure][a] game written as an example app for [Faux](https://github.com/raganwald/faux).
// You can play the game [here](http://raganwald.github.com/faux/examples/misadventure).
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