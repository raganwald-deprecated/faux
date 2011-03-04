;(function ($, undefined) {

// Location
// ---
//
// A `Location` represents a single cell in the corn maze. Locations are created by and
// owned by `LocationCollection` instances. Each Location instance has `.north`, `.east`,
// `.south`, and `.west` attributes, and these attributes are adjacent locations, with a
// few special conventions to deal with walls and the final escape from the maze:
//
// If `location.north() === location`, then that location's north edge has a wall. The
// rationale is that if you travel in that direction, you end up in the same place.
//
// If `_.isUndefined(location.north() )`, then that location's north edge leads out of
// the maze. It would be very confusing if that edge is not the edge of the maze,
// but this isn't enforced at the moment.

// Define `Location` in global scope
window.Location = Backbone.Model.extend({
  
  // initalize each location to be surrounded by walls
  initialize: function () {
    _(['north', 'south', 'east', 'west']).each(function (direction) {
      this.attributes[direction] = this;
    }, this);
  },
  
  // Methods that return the adjacent location, even if it is `this`.
  north: function () { return this.attributes.north && this.collection.get(this.attributes.north.id); },
  south: function () { return this.attributes.south && this.collection.get(this.attributes.south.id); },
  west: function () { return this.attributes.west && this.collection.get(this.attributes.west.id); },
  east: function () { return this.attributes.east && this.collection.get(this.attributes.east.id); },
  
  // Methods that return whether the adjacent location is a different location and passable.
  has_north: function () { return this.attributes.north && this !== this.attributes.north; },
  has_south: function () { return this.attributes.south && this !== this.attributes.south; },
  has_west: function () { return this.attributes.west && this !== this.attributes.west; },
  has_east: function () { return this.attributes.east && this !== this.attributes.east; },
  
  // Methods that return whether the adjacent location is passable, which could be
  // an adacent location or an exit.
  passage_north: function () { return this !== this.attributes.north; },
  passage_south: function () { return this !== this.attributes.south; },
  passage_west: function () { return this !== this.attributes.west; },
  passage_east: function () { return this !== this.attributes.east; },
  
  
  // Methods that return whether the adjacent location is the exit.
  escapes_north: function () { return undefined === this.attributes.north; },
  escapes_south: function () { return undefined === this.attributes.south; },
  escapes_west: function () { return undefined === this.attributes.west; },
  escapes_east: function () { return undefined === this.attributes.east; }
  
});

// LocationCollection
// ---
//
// A `LocationCollection` represents a corn maze. Every LocationCollection is initialized with a seed,
// and it uses `math.seedrandom` to generate an idempotent pseudo-random maze of locations using
// the [Recursive Division](http://weblog.jamisbuck.org/2011/1/12/maze-generation-recursive-division-algorithm)
// algorithm.
//
// Initializing a LocationCollection generates all of the locations automatically and wires them to each other.

// Define `LocationCollection` in global scope
window.LocationCollection = Backbone.Collection.extend({
  
  model: Location,
  
  initialize: function (models, options) {
    this.seed = options.seed || this._random_string();
    this.field_width = options.width || 15;
    this.field_height = options.height || 15;
    this._regenerate();
  },
  
  _random_string: function () {
    return Math.random().toString().substring(2);
  },
  
  // **Generate a New Maze**
  _regenerate: function () {
    var width = this.field_width;
    var height = this.field_height;
    Math.seedrandom(this.seed);
    
    // Start with a rectangle of locations
    this.field = _.range(0, height).map(function (row) {
      return _.range(0, width).map(function (col) {
        return new Location({ id: this._random_string(), row: row, col: col });
      }, this);
    }, this);
    
    // the centre will be the starting location
    this.centre = this.field[Math.floor(height/2)][Math.floor(width/2)];
    
    // Create passageways between adjacent locations inside the maze
    _(_.range(1, height)).each(function (i_row) {
      _(_.range(1, width)).each(function (j_col) {
        this.field[i_row][j_col].attributes.north = this.field[i_row - 1][j_col];
        this.field[i_row - 1][j_col].attributes.south = this.field[i_row][j_col].attributes;
        this.field[i_row][j_col].attributes.west = this.field[i_row][j_col - 1];
        this.field[i_row][j_col - 1].attributes.east = this.field[i_row][j_col];
      }, this);
    }, this);
    
    // open one exit
    var which = Math.random();
    if (which < 0.25) {
      var j_col = Math.floor(Math.random() * width);
      _(this.field).first()[j_col].attributes.north = undefined;
    }
    else if (which < 0.5) {
      var j_col = Math.floor(Math.random() * width);
      _(this.field).last()[j_col].attributes.south = undefined;
    }
    else if (which < 0.75) {
      var i_row = Math.floor(Math.random() * height);
      _(this.field[i_row]).first().attributes.west = undefined;
    }
    else {
      var i_row = Math.floor(Math.random() * height);
      _(this.field[i_row]).last().attributes.east = undefined;
    }
    
    // recursively bisect the field until it is a maze
    this._recursive_bisect(0, height - 1, 0, width - 1);
    
    // refresh the collection
    this.refresh(_.flatten(this.field));
  },
  
  // **[Recursive Division](http://weblog.jamisbuck.org/2011/1/12/maze-generation-recursive-division-algorithm)**
  _recursive_bisect: function (low_row, high_row, low_col, high_col) {
    var height = high_row - low_row + 1;
    var width = high_col - low_col + 1;
    if (width <= 1 || height <= 1) {
      return;
    }
    else if (width >= height) {
      var bisection_west;
      if (width == 2) {
        bisection_west = low_col;
      }
      else bisection_west = Math.floor(Math.random() * (width - 1)) + low_col;
      var opening = Math.floor(Math.random() * height) + low_row;
      _(_.range(low_row, high_row + 1)).chain()
        .without(opening)
        .each(function (row) {
          this.field[row][bisection_west].attributes.east = this.field[row][bisection_west];
          this.field[row][bisection_west + 1].attributes.west = this.field[row][bisection_west + 1];
        }, this);
      this._recursive_bisect(low_row, high_row, low_col, bisection_west);
      this._recursive_bisect(low_row, high_row, bisection_west + 1, high_col);
    }
    else {
      var bisection_low;
      if (height == 2) {
        bisection_low = low_row;
      }
      else bisection_low = Math.floor(Math.random() * (height - 1)) + low_row;
      var opening = Math.floor(Math.random() * width) + low_col;
      _(_.range(low_col, high_col + 1)).chain()
        .without(opening)
        .each(function (col) {
          this.field[bisection_low][col].attributes.south = this.field[bisection_low][col];
          this.field[bisection_low + 1][col].attributes.north = this.field[bisection_low + 1][col];
        }, this);
      this._recursive_bisect(low_row, bisection_low, low_col, high_col);
      this._recursive_bisect(bisection_low + 1, high_row, low_col, high_col);
    }
  }
  
}, {
  // A simple class-based cache to eliminate regenerating the maze on every page
  // refresh
  find_or_create: (function () {
    var cache = {};
    return function (options) {
      options || (options = {});
      var lc;
      if (_.isUndefined(options.seed)) {
        lc = new window.LocationCollection([]);
        cache[lc.seed] = lc;
      }
      else if (_.isUndefined(cache[options.seed])) {
        lc = new window.LocationCollection([], options);
        cache[options.seed] = lc;
      }
      else lc = cache[options.seed];
      return lc;
    };
  })()
});

// LocationView
// ---
//
// A `LocationView` handles displaying what the user sees at every location as they work their way through
// the maze. The `/haml/location.haml` template specifies exactly what to display on the page, at this
// time the view class encapsulates a little logic about a text description.
//
// Future expansions might include logic for displaying a picture or a partial map of the maze, stuff
// that should not be embedded in the template. Likewise, ther might be more complex interactivity that
// would require handling events in the view class.
//
// View classes in Backbone.js are usually all about displaying updated models and handling events.
// Since Misadventure's models are read-only, we don't need to worry about much in the way of wiring
// change events.

// Define `LocationView` in global scope.
window.LocationView = Backbone.View.extend({
  
  // `keydown` events are sent to input elements that have focus and 
  // to the document. We want them even though there's no input
  // element to have focus, so we'll bind our own handler to the
  // document. But first, we remove any other keydown event handlers
  before_render: function () {
    $(document).unbind('keydown.LocationView');
  },
  
  // After the template has been rendered, we bind our own handler to the
  // document.
  after_render: function () {
    var view = this;
    $(document).bind('keydown.LocationView', function (event) {
      var target = $('ol#' + view.model.id );
      var keyCode = event.keyCode || event.which;
      var arrow = { left: 37, up: 38, right: 39, down: 40 };
      if (target.does_not_exist()) {
        return;
      }
      else if (event.keyCode == arrow.up) {
        view.go_north();
      }
      else if (event.keyCode == arrow.down) {
        view.go_south();
      }
      else if (event.keyCode == arrow.left) {
        view.go_west();
      }
      else if (event.keyCode == arrow.right) {
        view.go_east();
      }
    });
  },
  
  // travel north if possible
  go_north: function () {
    if (this.model.has_north()) {
      this.options.controller.location({ location: this.model.north() });
    }
    else if (this.model.escapes_north()) {
      this.options.controller.bed({ location: this.model })
    }
  },
  
  // travel south if possible
  go_south: function () {
    if (this.model.has_south()) {
      this.options.controller.location({ location: this.model.south() });
    }
    else if (this.model.escapes_south()) {
      this.options.controller.bed({ location: this.model })
    }
  },
  
  // travel east if possible
  go_east: function () {
    if (this.model.has_east()) {
      this.options.controller.location({ location: this.model.east() });
    }
    else if (this.model.escapes_east()) {
      this.options.controller.bed({ location: this.model })
    }
  },
  
  // travel west if possible
  go_west: function () {
    if (this.model.has_west()) {
      this.options.controller.location({ location: this.model.west() });
    }
    else if (this.model.escapes_west()) {
      this.options.controller.bed({ location: this.model })
    }
  },
  
  // The text description is a clumsy homage to [Adventure][play].
  //
  // [play]: http://unspace.github.com/faux/examples/misadventure/
  text_description: (function () {
    var descriptions = ['a hole with no way out',
      'a little maize of twisting passages',
      'a little maize of twisty passages',
      'a little twisty maize of passages',
      'a maize of little twisting passages',
      'a maize of little twisty passages',
      'a maize of twisting little passages',
      'a maize of twisty little passages',
      'a twisting little maize of passages',
      'a twisting maize of little passages',
      'a twisty little maize of passages',
      'a twisty maize of little passages',
      'a little twisting maize of passages',
      'amazing little twisting passages',
      'amazing little twisty passages',
      'amazing twisting little passages'];
    return function () {
      return descriptions[
        (this.model.has_north() ? 1 : 0) + 
        (this.model.has_south() ? 2 : 0) + 
        (this.model.has_west() ? 4 : 0) + 
        (this.model.has_east() ? 8 : 0)
      ];
    };
  })(),
  
  // a rough approximation of what you might see here
  passage_image_source: (function () {
    var passages = ['./images/passages1.png',
      './images/passages1.png',
      './images/passages2.png',
      './images/passages3.png',
      './images/passages4.png'];
    return function () {
      return passages[
        (this.model.has_north() ? 1 : 0) + 
        (this.model.has_south() ? 1 : 0) + 
        (this.model.has_west() ? 1 : 0) + 
        (this.model.has_east() ? 1 : 0)
      ];
    };
  })()
  
});

})(jQuery);

// This file is part of [Misadventure](http://github.com/unspace/faux/tree/master/examples/misadventure), an extremely 
// simple [adventure][a] game written as an example app for [Faux](https://github.com/unspace/faux).
// You can play the game [here](http://unspace.github.com/faux/examples/misadventure).
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