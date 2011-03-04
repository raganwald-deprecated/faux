(function (globals) {
  
  globals.ValueCollection = Backbone.Collection.extend({
  
    initialize: function () {
      this.refresh(
        _.range(1, 26).map(function (n) {
          return new Backbone.Model({ id: n, n: n });
        })
      );
    }
  
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