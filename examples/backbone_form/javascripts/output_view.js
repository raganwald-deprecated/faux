;(function (globals) {
  
var converter = new globals.Showdown.converter();

globals.OutputView = Backbone.View.extend({
  initialize: function () {
    this.text = this.options.text;
    this.html = converter.makeHtml(this.text)
  }
});

})(window);