;(function () {

var controller = new Faux.Controller({
  save_location: true,
  element_selector: '.content',
  partial: 'haml',
  partial_suffix: '.haml',
  javascript: 'javascripts',
  title: 'Const'
});

var PseudoFetch

controller
  .method('const', {
    
  });

$(function() {
  controller.define_all(function () {
    Backbone.history.start();
    window.location.hash || controller.original();
  });
});
	
})();

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