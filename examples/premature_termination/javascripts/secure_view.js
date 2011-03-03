;(function (globals) {

globals.SecureView = Backbone.View.extend({
  initialize: function () {
    globals.alert("we shouldn't render a secure view");
  }
});

})(window);