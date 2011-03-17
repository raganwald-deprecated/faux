;(function (globals) {

var controller = new Faux.Controller({
  save_location: true,
  element_selector: '.content',
  partial: 'haml',
  partial_suffix: '.haml',
  javascript: 'javascripts'
});

var lazy_model = new (Backbone.Model.extend({
  // The 'fetch' method simulates a request to the server
  fetch : function(options) {
    options || (options = {});
    if (!this.set({message: "Hello, Lazy World"}, options)) return false;
    if (options.success) options.success(this, {message: "Hello, Lazy World"});
    return this;
  }
}))();

controller
  .method('constant', {
    'model=': lazy_model,
    clazz: Backbone.View
  });

$(function() {
  controller.define_all(function () {
    Backbone.history.start();
    window.location.hash || controller.constant();
  });
});
	
})(window);

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

To the extent possible under law, Reg Braithwaite has waived all copyright 
and related or neighboring rights to the software, except for those portions
that are otherwise licensed.

This work is published from Canada.

*/