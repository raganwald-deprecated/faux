;(function (globals) {
  
  // See [A program to compute the nth Fibonacci number][fib]
  // [fib]: https://github.com/raganwald/homoiconic/blob/master/2008-12-12/fibonacci.md#readme
  globals.MatrixView = Backbone.View.extend({
    
    initialize: function () {
      this.model.bind('change:n', this.render);
    },
    
    n: function () {
      return parseInt(this.model.attributes.n);
    },
    
    fibonacci: (function () {
      
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
          n = this.n();
        }
        if (n < 2) {
          return new BigNumber(n);
        }
        else return power(one_one_zero, n - 1)[0];
      }
      
    })()
    
  });
  
})(window);

// This file is part of [Nonpareil](http://github.com/raganwald/knob_and_tube), 
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