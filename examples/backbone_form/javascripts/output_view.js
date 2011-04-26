;(function (globals) {
  
var converter = new globals.Showdown.converter();

globals.OutputView = Backbone.View.extend({
  initialize: function () {
    this.html = converter.makeHtml(this.options.text)
  }
});

})(window);