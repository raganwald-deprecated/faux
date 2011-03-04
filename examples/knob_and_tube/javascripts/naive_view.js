;(function (globals) {
  
  globals.NaiveView = Backbone.View.extend({
    
    initialize: function () {
      this.model.bind('change:n', this.render);
    },
    
    n: function () {
      return parseInt(this.model.attributes.n);
    },
    
    fibonacci: function (n) {
      if (_.isUndefined(n)) {
        n = this.n();
      }
      if (n < 2) {
        return new BigNumber(n);
      }
      else {
        var previous = this.fibonacci(n - 1);
        var double_previous = this.fibonacci(n - 2);
        return previous.add(double_previous);
      }
    }
    
  });
  
})(window);

// This file is part of [Nonpareil](http://github.com/raganwald/faux/examples/knob_and_tube), 
// an example app for [Faux](https://github.com/raganwald/faux).
// You can see it [here](http://raganwald.github.com/faux/examples/knob_and_tube).

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