;(function (globals) {

globals.OriginalView = Backbone.View.extend({
  initialize: function () {
    globals.alert("we shouldn't render the original view");
  }
});

})(window);