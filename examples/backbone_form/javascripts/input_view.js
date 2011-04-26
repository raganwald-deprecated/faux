;(function (globals) {

globals.InputView = Backbone.View.extend({
  
  events: {
    'submit' : 'preview'
  },
  
  preview: function (event) {
    event.preventDefault();
    event.stopPropagation();
    var form = $(event.target).parents('form').andSelf().filter('form');
    var attrs = _.foldl(form.serializeArray(),
      "acc, obj -> ((acc[obj.name] = obj.value) && acc) || acc".lambda(),
      {}
    );
    this.options.controller.output(attrs);
  }
  
});

})(window);