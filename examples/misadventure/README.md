Misadventure
===

Misadventure is an extremely simple [adventure][a] game. Go ahead, [play the game][play].

**more information**

Every time you "wake up in a cornfield," you get a new maze. At the moment, all mazes are drawn on 15x15 grids. You start in the centre, and there is just one exit. Every time you play, you get a different maze. Misadventure uses [Recursive Division][r] to generate mazes.

You can click the links or use the arrow keys to navigate.

Each URL encodes enough information for Misadventure to create the maze and remember your position in it, so you can bookmark a position, and when you come back you will be in the same maze. Standard navigation like the back button and highlighting of followed links works just as you'd expect. When you succeed in escaping the maze, Misadventure will draw the maze for you.

If your browser leaks privacy information, Misadventure will show you which parts of the maze you have visited when it draws the map.

<a href="http://www.flickr.com/photos/vkareh/2997275679/" title="Corn Maze by vkareh, on Flickr"><img src="http://farm4.static.flickr.com/3205/2997275679_9ff3cfd478.jpg" width="500" height="375" alt="Corn Maze" /></a>

**source code and code review**

Misadventure is built on [Faux][f], another Unspace project. [Reginald Braithwaite][rb] wrote Misadventure's code and [Shawn Allison][s] provided the graphic design.

You're looking at this in [Github][source], so read the code for yourself, fork it, go wild. You can also read the annotated source for [controller.js][cjs], [bed_view.js][bvjs], and [location.js][ljs].And best of all, you can read the "Misadventure Code Review," a series of blog posts walking through the source code: Part I: [Overview][pi], Part II: [controller.wake()][pii], Part III: [Models and Views][piii], and this just in: Part IV: [Class Loading][piv].

**warning: spoiler**

Thanks to this being a web application that works with the web's existing model of URLs and links, the maze is easy to solve without pencil and paper. That's because browsers style links differently depending on whether you've visited their destination already or not, and because the browser provides a back button you can use as many times as you like. So here's how to solve the maze:

1. If you have one or more destination links that you haven't visited before, pick any one. You can always pick the same one, pick one at random, pick the one closest to the mouse, it doesn't matter. Look at the colours of the links and pick one you haven't visited before.
2. If you've visited all of the destinations, retreat to the location that you visited before this one. Note that if you travel from A to B to C and you retreat from C to B, if you retreat from B you have to go back to A, not to C.
3. Repeat one and two until you escape the corn maze.

Now step one is easy because your browser shows you which links lead to places you've already visited. Step two can be a problem if you have to retreat multiple times. Our browser can help with this as well! Instead of trying to remember a stack of retreat directions, simply use your browser's back button. Misadventure works with the web, so you can simply click the back button as many times as you need to retreat to a location where you have another unvisited destination to select.

Good luck!

**license**

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

> To the extent possible under law, [Unspace Interactive][ui] has waived all copyright 
and related or neighboring rights to the software, except for those portions
that are otherwise licensed.

> This work is published from Canada.

*Misadventure's first user was Thomas Ashton Braithwaite*

[a]: http://www.digitalhumanities.org/dhq/vol/001/2/000009/000009.html
[f]: https://github.com/unspace/faux
[play]: http://unspace.github.com/misadventure/
[r]: http://weblog.jamisbuck.org/2011/1/12/maze-generation-recursive-division-algorithm
[j]: http://weblog.jamisbuck.org/
[rb]: http://reginald.braythwayt.com
[source]: http://github.com/unspace/misadventure
[docco]: https://github.com/raganwald/homoiconic/blob/master/2010/11/docco.md "A new way to think about programs"
[cjs]: http://unspace.github.com/misadventure/docs/controller.html
[bvjs]: http://unspace.github.com/misadventure/docs/bed_view.html
[ljs]: http://unspace.github.com/misadventure/docs/location.html
[s]: http://yayinternets.com/
[ui]: http://unspace.ca
[pi]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_i.md#readme
[pii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_ii.md#readme
[piii]: http://github.com/raganwald/homoiconic/tree/master/2011/01/misadventure_part_iii.md#readme
[piv]: http://github.com/raganwald/homoiconic/tree/master/2011/02/misadventure_part_iv.md#readme